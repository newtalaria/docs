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
lastReviewed: '2026-10-30'
owner: docs
---
# SiteHost containers

## What you're setting up

Forward logs from your SiteHost PHP container to Talaria using the OpenTelemetry Collector.

## Why use this

The collector tails Apache error logs, PHP-FPM logs, cron task logs, and your application logs.

## Before you start

- A SiteHost PHP container
- Talaria project API key with `logs:write` scope
- (Optional) `talaria/silverstripe` package for container health metrics

## Steps

### 1. Create monitor configuration

Add `talaria/monitors.yaml` to your repository root:

```yaml
monitors: []
```

This enables the OpenTelemetry Collector in your container.

### 2. Set environment variables

Configure these in your SiteHost control panel:

- `TALARIA_API_KEY` – A secret key (`tal_sk_<env>_<cell>_…`)
- Leave `TALARIA_URL` unset on Talaria Cloud. The preset derives `https://ingest-<cell>.newtalaria.com` from the key. Set `TALARIA_URL` only for a custom domain.
- `OTEL_SERVICE_NAME` – Service name (defaults to `silverstripe`)
- `OTEL_RESOURCE_ATTRIBUTES="container.name=..."` – Container identifier (defaults to hostname)

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

### 4. Default log sources

The preset collector configuration tails these files:

- `/container/logs/apache2/error.log` – Apache errors
- `/container/logs/php-fpm/*.log` – PHP-FPM logs
- `/container/logs/cron-*.log` – Cron task output
- `/container/logs/sitehost/sitehost.log` – Application logs

#### Excluded by default

- Rotated archives (`*.gz`)
- Access logs
- rsyslog, supervisor, and internal Talaria logs

### 5. Log severity mapping

The collector parses severity from Apache and PHP-FPM log formats:

| Source level | Talaria severity |
|--------------|------------------|
| `notice`, `info` | info |
| `warn`, `warning` | warn |
| `error` | error |
| `crit`, `critical`, `alert`, `emerg` | fatal |

### 6. Container health metrics (Silverstripe only)

If you have `talaria/silverstripe` installed, the `talaria-sitehost-probe` reports container health metrics once per minute:

- Supervisord program statuses (`RUNNING`, `EXITED`, `FATAL`)
- Free disk space on `/container`
- Environment variable presence checks

Set `metrics:write` scope on your API key to receive these metrics.

### 7. Cron monitors (Silverstripe only)

`vendor/bin/talaria-sitehost install` reconciles one crontab block and the supervisord probe. It registers each monitor with the secret `tal_sk_` key (`monitors:write`) on `POST /v1/monitors/{slug}/check-ins` and stores the returned `tal_mon_<cell>_…` token. Cron lines check in with that token on `POST /v1/check-ins` (`Authorization: Bearer`), so the crontab never holds the secret key. A second run reuses the stored tokens. See [Monitors](../../features/monitors.md).

## Check it worked

After deployment:

1. Check `/container/logs/talaria-otelcol.log` for collector status
2. View logs in your Talaria project dashboard under **Events**
3. Filter by `service.name`, `container.name`, or `deployment.environment.name`

## Troubleshooting

### Logs not appearing

**Cause:** `TALARIA_API_KEY` is unset, the key is not a secret key, or it lacks `logs:write`.

**Fix:**

- Verify `TALARIA_API_KEY` is set to a secret key
- Check collector logs for authentication errors
- Ensure API key has `logs:write` scope

### Custom configuration not applied

**Cause:** `talaria/collector.yaml` did not pass collector validation.

**Fix:**

- Run `otelcol-contrib validate` locally to check YAML syntax
- Review `/container/logs/talaria-otelcol.log` for validation errors

### Collector not starting

**Cause:** `talaria/monitors.yaml` is missing, or supervisord did not start `talaria-otelcol`.

**Fix:**

- Verify `talaria/monitors.yaml` exists in your repository
- Check supervisord status with `supervisorctl status talaria-otelcol`

## Next steps

- [Kubernetes](kubernetes.md)
- [Silverstripe SDK](../../sdk/silverstripe/README.md)
