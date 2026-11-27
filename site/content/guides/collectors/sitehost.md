---
title: SiteHost containers
description: Run the OpenTelemetry Collector inside a SiteHost PHP container and export logs over OTLP/HTTP.
section: guides
order: 50
---

Forward logs from a SiteHost PHP container to Talaria with an **in-container** OpenTelemetry Collector under supervisord. Run the collector inside the container; a sidecar container cannot read `/container/logs`.

This page is the SiteHost **case study**: the recipe we test, not a generic PHP host guide. The supported baseline is below. OTLP is HTTP only (no gRPC). Egress is port 443.

## Supported baseline

The supported image is **Ubuntu 24.04**, **PHP 8.2**, **Apache**, and **supervisord**, with application and web logs under `/container/logs`. Other images may work but are not tested. Check that the container can reach ingest on port **443**.

## Before you start

- A SiteHost PHP container that matches the baseline
- A project **secret** key with `logs:write`, set only as a container environment variable (`tal_sk_<env>_<cell>_…`). Restart the container after changing env vars
- The `talaria/silverstripe` package if you want the SiteHost installer and optional probe (`composer require talaria/silverstripe:^3.0`, current release **3.0.3**)

OTLP is HTTP only (protobuf or JSON, gzip allowed). There is no gRPC ingest. Egress is **443** to `https://ingest-nz1.newtalaria.com/otlp` (or `https://ingest-<cell>.newtalaria.com/otlp` for another cell).

## Install

Add `talaria/sitehost/monitors.json` to the application. When that file is present, the SiteHost deploy action runs `vendor/bin/talaria-sitehost install` and also installs the log collector (official **otelcol-contrib 0.164.0**, SHA-256 verified, started as supervisord program `talaria-otelcol`). You can run the same installer yourself:

```bash
vendor/bin/talaria-sitehost install
```

`monitors.json` must contain a non-empty `jobs` array:

```json
{
  "jobs": [
    {
      "slug": "process-job-queue",
      "crontab": "* * * * *",
      "timezone": "Pacific/Auckland",
      "command": "cd /container/application && vendor/bin/sake dev/tasks/ProcessJobQueueTask"
    }
  ]
}
```

The installer reconciles one crontab block (`# talaria-sitehost begin` … `# talaria-sitehost end`) and the supervisord probe. Registration uses the secret key on `POST /v1/monitors/{slug}/check-ins`. Cron lines then check in with a stored token on `POST /v1/check-ins` so the crontab never holds the secret key. A second run reuses those tokens.

The collector binary lives under `/container/application/.talaria`, with logs at `/container/logs/talaria-otelcol.log` and `/container/logs/talaria-otelcol.err`. The optional probe logs to `/container/logs/talaria-sitehost-probe.log`.

## Environment

Set these in the SiteHost control panel (not in git):

- `TALARIA_API_KEY` — secret key with `logs:write` (and `monitors:write` if you register check-ins)
- Leave `TALARIA_URL` unset on Talaria Cloud. The installer derives `https://ingest-<cell>.newtalaria.com` from the key for monitor registration (`POST /v1/monitors/{slug}/check-ins`). A `self` cell needs `TALARIA_URL` set to that origin. Collector export uses the same host plus `/otlp`.
- Leave secrets out of the repository

## Logs

The collector tails files under `/container/logs` (Apache, PHP-FPM, cron, and application logs on the supported image). Override includes with `talaria/collector.yaml` if you need a tighter set.

## Verify

After install, confirm `/container/logs/talaria-otelcol.log` and look for logs in the dashboard, filtered by `service.name` or `container.name`.

The PHP, Laravel, or Silverstripe SDK is complementary: it sends exceptions, traces, and structured logs from the app, on top of these file logs. See the [PHP SDK](/sdk/php/) and [Silverstripe](/sdk/silverstripe/).
