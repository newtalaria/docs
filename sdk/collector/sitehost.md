# SiteHost logs

A SiteHost web container has no Docker socket and no host root. `vendor/bin/talaria-sitehost install` in `talaria/silverstripe` 2.1.3 downloads otelcol-contrib 0.162.0 into the application directory and writes `/container/config/talaria-otelcol.yaml`. The SiteHost deploy action runs that command when `talaria/sitehost/monitors.json` is present. An image replacement removes `supervisord.conf` and this file. The next deploy writes them again. The binary stays under the application directory and is reused when the version matches.

The exporter address is the project DSN with `/otlp` on the end. The collector appends `/v1/logs`, so the request is `POST /otlp/v1/logs`. `X-API-Key` is `${env:TALARIA_API_KEY}`. The key is not written into the file. It needs `logs:write`.

```yaml
receivers:
  filelog:
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
        value: silverstripe
        action: upsert
      - key: container.name
        value: web
        action: upsert
      - key: deployment.environment.name
        value: production
        action: upsert
  batch: {}
exporters:
  otlphttp:
    endpoint: https://api.newtalaria.com/otlp
    headers:
      X-API-Key: ${env:TALARIA_API_KEY}
    compression: gzip
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [memory_limiter, resource, batch]
      exporters: [otlphttp]
```

The installer fills `service.name`, `container.name`, and `deployment.environment.name` from `TALARIA_SERVICE_NAME`, `TALARIA_CONTAINER_NAME`, and `TALARIA_ENVIRONMENT`. Unset names become `silverstripe`, the container hostname, and `production`.

It reads the current Apache error log, PHP-FPM log, cron task logs, and `sitehost/sitehost.log`, starting at the end of each file. Rotated archives, access logs, rsyslog, and supervisor logs are left out. rsyslog records the crontab command. Apache `error` and `crit`, and PHP-FPM `ERROR` and `CRITICAL`, are sent as error severity. Other lines stay info.

The same install adds this supervisord program and runs `supervisorctl update`:

```ini
[program:talaria-otelcol]
command=/container/application/.talaria/otelcol-contrib --config=/container/config/talaria-otelcol.yaml
directory=/container/application
autostart=true
autorestart=true
stdout_logfile=/container/logs/talaria-otelcol.log
stderr_logfile=/container/logs/talaria-otelcol.err
```

Container gauges stay on the probe, which posts `POST /otlp/v1/metrics` for the container's own cgroup. That key needs `metrics:write`. The probe cannot see the node.

`talaria/silverstripe` also ships `talaria-sitehost-probe`. The deploy action re-adds this supervisord program because an image replacement replaces `supervisord.conf`:

```ini
[program:talaria-sitehost-probe]
command=/container/application/vendor/bin/talaria-sitehost-probe
directory=/container/application
autostart=true
autorestart=true
```

Once a minute the probe reports `supervisord:<program>` (`RUNNING`, `EXITED`, or `FATAL`), free space on `/container`, and whether `TALARIA_API_KEY` and `SS_DATABASE_SERVER` are set. It sends the names only.
