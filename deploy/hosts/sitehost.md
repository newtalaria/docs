---
id: sitehost-collector
title: SiteHost containers
navTitle: SiteHost
description: Tail container logs and run supervisord health checks on SiteHost PHP hosting.
type: guide
section: deploy
platform:
  - php
  - laravel
  - silverstripe
feature: []
host: sitehost
order: 20
lastReviewed: '2026-10-29'
owner: docs
---
# SiteHost containers

Forward logs from your SiteHost PHP container to Talaria using the OpenTelemetry Collector. The collector tails Apache error logs, PHP-FPM logs, cron task logs, and your application logs.

## Prerequisites

- A SiteHost PHP container
- Talaria project API key with `logs:write` scope
- (Optional) `talaria/silverstripe` package for container health metrics

## Configure log collection

### 1. Create monitor configuration

Add `talaria/sitehost/monitors.json` to your repository root:

```json
{
  "monitors": []
}
```

This enables the OpenTelemetry Collector in your container.

### 2. Set environment variables

Configure these in your SiteHost control panel:

- `TALARIA_API_KEY` – Your project API key
- `TALARIA_DSN` – Your Talaria endpoint (e.g., `https://api.newtalaria.com`)
- `TALARIA_SERVICE_NAME` – Service name (defaults to `silverstripe`)
- `TALARIA_ENVIRONMENT` – Environment name (defaults to `production`)
- `TALARIA_CONTAINER_NAME` – Container identifier (defaults to hostname)

### 3. (Optional) Customize log collection

Create `talaria/collector.yaml` in your repository to override the default configuration. This example collects only Apache errors and cron logs:

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
        value: my-app
        action: upsert
```

The collector merges your configuration with the built-in preset, which provides:
- Severity parsing for Apache and PHP-FPM logs
- Storage for checkpoints
- OTLP exporter with compression
- Memory limits

## Default log sources

The preset collector configuration tails these files:

- `/container/logs/apache2/error.log` – Apache errors
- `/container/logs/php-fpm/*.log` – PHP-FPM logs
- `/container/logs/cron-*.log` – Cron task output
- `/container/logs/sitehost/sitehost.log` – Application logs

### Excluded by default

- Rotated archives (`*.gz`)
- Access logs
- rsyslog, supervisor, and internal Talaria logs

## Log severity mapping

The collector parses severity from Apache and PHP-FPM log formats:

| Source level | Talaria severity |
|--------------|------------------|
| `notice`, `info` | info |
| `warn`, `warning` | warn |
| `error` | error |
| `crit`, `critical`, `alert`, `emerg` | fatal |

## Container health metrics (Silverstripe only)

If you have `talaria/silverstripe` installed, the `talaria-sitehost-probe` reports container health metrics once per minute:

- Supervisord program statuses (`RUNNING`, `EXITED`, `FATAL`)
- Free disk space on `/container`
- Environment variable presence checks

Set `metrics:write` scope on your API key to receive these metrics.

## Verify collection

After deployment:

1. Check `/container/logs/talaria-otelcol.log` for collector status
2. View logs in your Talaria project dashboard under **Logs**
3. Filter by `service.name`, `container.name`, or `deployment.environment.name`

## Troubleshooting

**Logs not appearing:**
- Verify `TALARIA_API_KEY` and `TALARIA_DSN` are set
- Check collector logs for authentication errors
- Ensure API key has `logs:write` scope

**Custom configuration not applied:**
- Run `otelcol-contrib validate` locally to check YAML syntax
- Review `/container/logs/talaria-otelcol.log` for validation errors

**Collector not starting:**
- Verify `talaria/sitehost/monitors.json` exists in your repository
- Check supervisord status with `supervisorctl status talaria-otelcol`
