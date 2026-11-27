---
title: SiteHost containers
description: Run the OpenTelemetry Collector inside a SiteHost PHP container and send logs to Talaria over OTLP/HTTP.
section: guides
order: 20
---

Forward logs from a SiteHost PHP container to Talaria with an **in-container** OpenTelemetry Collector.

## Tested with

Ubuntu 24.04, PHP 8.2, Apache and supervisord, with logs under `/container/logs`. Other images may work but have not been tested yet.

## Before you start

- A SiteHost PHP container (see Tested with)
- A Talaria project **secret** key with `logs:write`, set only as a container environment variable (`tal_sk_<env>_<cell>_…`). Restart the container after changing env vars.
- Optional: the `talaria/silverstripe` package if you also want container health metrics

OTLP is HTTP only (protobuf or JSON, gzip allowed). There is no gRPC ingest.

## Install the collector

Add `talaria/sitehost/monitors.json` to the application. When that file is present, the SiteHost deploy action runs `vendor/bin/talaria-sitehost install` and installs the collector under supervisord:

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

`jobs` must not be empty.

## Environment

Set these in the SiteHost control panel (not in git):

- `TALARIA_API_KEY` — the secret key
- Leave `TALARIA_URL` unset on Talaria Cloud. The preset derives `https://ingest-<cell>.newtalaria.com` from the key.
- `OTEL_SERVICE_NAME` — defaults to `silverstripe` if unset
- `OTEL_RESOURCE_ATTRIBUTES` — for example `container.name=…`

## Logs

The collector tails files under `/container/logs` (Apache, PHP-FPM, cron, and application logs on the verified image). Override includes with `talaria/collector.yaml` if you need a tighter set.

This case study will be expanded in Phase 7 with image assumptions, payload limits, and what the PHP SDK adds on top of file logs.
