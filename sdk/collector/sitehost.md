# SiteHost logs

A SiteHost web container has no Docker socket and no host root. The Collector runs inside the container and tails `/container/logs`.

```yaml
receivers:
  filelog:
    include: [/container/logs/*.log]
    start_at: end
processors:
  resource:
    attributes:
      - key: service.name
        value: silverstripe
        action: upsert
      - key: container.name
        value: ${env:TALARIA_CONTAINER_NAME}
        action: upsert
  batch: {}
exporters:
  otlphttp:
    endpoint: https://api.newtalaria.com
    headers:
      X-API-Key: ${env:TALARIA_API_KEY}
    compression: gzip
service:
  pipelines:
    logs:
      receivers: [filelog]
      processors: [resource, batch]
      exporters: [otlphttp]
```

The key needs `logs:write`. The same container can send `metrics:write` for its own cgroup. It cannot see the node.

`talaria/silverstripe` ships `talaria-sitehost-probe`. The deploy action re-adds this supervisord program because an image replacement replaces `supervisord.conf`:

```ini
[program:talaria-sitehost-probe]
command=/container/application/vendor/bin/talaria-sitehost-probe
directory=/container/application
autostart=true
autorestart=true
```

Once a minute the probe reports `supervisord:<program>` (`RUNNING`, `EXITED`, or `FATAL`), free space on `/container`, and whether `TALARIA_API_KEY` and `SS_DATABASE_SERVER` are set. It sends the names only.
