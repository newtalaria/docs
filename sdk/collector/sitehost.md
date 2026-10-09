# SiteHost logs

A SiteHost web container has no Docker socket and no host root. When the app contains `talaria/sitehost/monitors.json`, the SiteHost deploy action downloads otelcol-contrib 0.162.0 to `/container/application/.talaria/otelcol-contrib` and starts one supervisord program. A later deploy reuses the binary when `.talaria/otelcol-contrib.version` is `0.162.0`. An image replacement removes `supervisord.conf`. The next deploy writes the program again.

The collector reads Collector YAML. It does not read a Talaria-specific config language. The deploy copies a preset to `/container/application/.talaria/collector-preset.yaml` and, when the app has `talaria/collector.yaml`, passes that file as a second `--config`. Maps merge. An array, including `include` and `exclude`, is replaced by the later file. Leaving `exclude` out of the project file keeps the preset's exclusions.

The exporter address is `TALARIA_DSN` with `/otlp` on the end, applied with `--set` after both files. The collector appends `/v1/logs`, so the request is `POST /otlp/v1/logs`. `X-API-Key` is `${env:TALARIA_API_KEY}`. The key is not written into either file. It needs `logs:write`.

`otelcol-contrib validate` runs on those same arguments. A file that does not validate does not restart the running program.

Checkpoints are stored in `${SITEHOST_APP_PATH}/.talaria/otelcol-storage`. `start_at: end` applies the first time a file is seen. A later restart continues from the checkpoint.

## Preset

The preset tails the Apache error log, PHP-FPM logs, cron task logs, and `sitehost/sitehost.log`. Rotated archives, access logs, rsyslog, and supervisor logs are left out. rsyslog records the crontab command. Apache `error` and `crit`, and PHP-FPM `ERROR` and `CRITICAL`, are sent as error severity. Other lines stay info. The `endpoint` below is a placeholder. The deploy replaces it.

`service.name`, `container.name`, and `deployment.environment.name` come from `TALARIA_SERVICE_NAME`, `TALARIA_CONTAINER_NAME`, and `TALARIA_ENVIRONMENT`. Unset names become `silverstripe`, the container hostname, and `production`.

```yaml
extensions:
  file_storage:
    directory: ${env:SITEHOST_APP_PATH}/.talaria/otelcol-storage
    create_directory: true

receivers:
  file_log:
    include:
      - /container/logs/apache2/error.log
      - /container/logs/php-fpm/*.log
      - /container/logs/cron-*.log
      - /container/logs/sitehost/sitehost.log
    exclude:
      - /container/logs/**/*.gz
      - /container/logs/apache2/access.log
      - /container/logs/apache2/other_vhosts_access.log
      - /container/logs/rsyslog/*
      - /container/logs/supervisor/*
      - /container/logs/talaria-otelcol.log
      - /container/logs/talaria-otelcol.err
      - /container/logs/talaria-sitehost-probe.log
      - /container/logs/talaria-sitehost-probe.err
    start_at: end
    storage: file_storage
    operators:
      - type: regex_parser
        parse_from: body
        regex: '\[(?:[^\]]*:)?(?P<level>notice|info|warn|warning|error|crit|alert|emerg|critical|debug)\]'
        on_error: send_quiet
      - type: regex_parser
        parse_from: body
        regex: '(?i)(?:^|\s)(?P<level>NOTICE|INFO|WARNING|WARN|ERROR|CRITICAL|CRIT|ALERT|EMERG|DEBUG)\s*:'
        on_error: send_quiet
      - type: severity_parser
        parse_from: attributes.level
        on_error: send_quiet
        mapping:
          info:
            - notice
            - info
          warn:
            - warn
            - warning
          error:
            - error
          fatal:
            - crit
            - alert
            - emerg
            - critical

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 128
    spike_limit_mib: 25
  resource:
    attributes:
      - key: service.name
        value: ${env:TALARIA_SERVICE_NAME}
        action: upsert
      - key: container.name
        value: ${env:TALARIA_CONTAINER_NAME}
        action: upsert
      - key: deployment.environment.name
        value: ${env:TALARIA_ENVIRONMENT}
        action: upsert
  batch: {}

exporters:
  otlp_http:
    endpoint: http://127.0.0.1:1
    headers:
      X-API-Key: ${env:TALARIA_API_KEY}
    compression: gzip

service:
  extensions: [file_storage]
  pipelines:
    logs:
      receivers: [file_log]
      processors: [memory_limiter, resource, batch]
      exporters: [otlp_http]
```

## Project file

`talaria/collector.yaml` is optional. This example keeps cron and Apache error logs and sets the service name. The preset still supplies the parsers, the exclusions, the memory limiter, and the exporter.

```yaml
receivers:
  file_log:
    include:
      - /container/logs/apache2/error.log
      - /container/logs/cron-*.log
processors:
  resource:
    attributes:
      - key: service.name
        value: silverstripe
        action: upsert
```

## Supervisord

The deploy writes this program. The command passes the preset, then the project file when it exists, then the endpoint.

```ini
[program:talaria-otelcol]
command=/usr/bin/env SITEHOST_APP_PATH=/container/application TALARIA_SERVICE_NAME=silverstripe TALARIA_CONTAINER_NAME=web TALARIA_ENVIRONMENT=production /container/application/.talaria/otelcol-contrib --config=file:/container/application/.talaria/collector-preset.yaml --config=file:/container/application/talaria/collector.yaml --set=exporters.otlp_http.endpoint=https://api.newtalaria.com/otlp
directory=/container/application
autostart=true
autorestart=true
stdout_logfile=/container/logs/talaria-otelcol.log
stderr_logfile=/container/logs/talaria-otelcol.err
```

Without `talaria/collector.yaml`, the second `--config` is omitted.

Container gauges stay on the probe, which posts `POST /otlp/v1/metrics` for the container's own cgroup. That key needs `metrics:write`. The probe cannot see the node.

`talaria/silverstripe` ships `talaria-sitehost-probe`. The deploy action re-adds this supervisord program because an image replacement replaces `supervisord.conf`:

```ini
[program:talaria-sitehost-probe]
command=/container/application/vendor/bin/talaria-sitehost-probe
directory=/container/application
autostart=true
autorestart=true
```

Once a minute the probe reports `supervisord:<program>` (`RUNNING`, `EXITED`, or `FATAL`), free space on `/container`, and whether `TALARIA_API_KEY` and `SS_DATABASE_SERVER` are set. It sends the names only.
