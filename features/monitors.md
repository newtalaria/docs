---
id: monitors
title: Cron and job monitors
navTitle: Cron monitors
description: >-
  Check in from cron or scheduled jobs so a missed run opens an issue
  automatically.
type: feature
section: features
platform: []
feature:
  - monitors
order: 100
lastReviewed: '2026-10-29'
owner: docs
---
# Job monitors

A monitor is a schedule Talaria expects to hear from. A cron line, a Kubernetes CronJob, or the SiteHost probe sends `in_progress`, then `ok` or `error`. When the slot plus its margin passes with no `ok`, Talaria opens one issue.

`POST /v1/monitors/{slug}/check-ins` needs a **secret key** with `monitors:write`. `POST /v1/check-ins` needs a monitor token (`tal_mon_`). The monitor token is for a crontab that must not contain the secret key.

## Check in from PHP

```php
Talaria::monitor('process-job-queue', [
    'crontab' => '* * * * *',
    'timezone' => 'Pacific/Auckland',
    'maxRuntimeSeconds' => 55,
], function () {
    // the job
});
```

`monitor` sends `in_progress`, runs the callback, then sends `ok` or `error` and flushes before the process exits.

## Check in from cron

Register the schedule once with `POST /v1/monitors/{slug}/check-ins` and a **secret key** that has `monitors:write`. The response includes `monitorToken` (`tal_mon_`) a single time. Store it outside the repository. Cron check-ins then use `POST /v1/check-ins` with that monitor token.

```bash
curl -fsS -X POST "https://ingest-nz1.newtalaria.com/v1/check-ins" \
  -H "Authorization: Bearer $TALARIA_MONITOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ok"}'
```

`status` is `in_progress`, `ok`, or `error`. Optional fields are `runId`, `durationSeconds`, and `logTail`. `POST /v1/check-ins` needs a monitor token (`tal_mon_`). `POST /v1/monitors/{slug}/check-ins` needs a **secret key** with `monitors:write`.

The SiteHost deploy action writes these lines when the app contains `talaria/monitors.yaml`:

```yaml
version: 1
monitors:
  - slug: process-job-queue
    schedule:
      crontab: "* * * * *"
      timezone: Pacific/Auckland
    marginSeconds: 120
    maxRuntimeSeconds: 55
    command: "cd /container/application && vendor/bin/sake dev/tasks/ProcessJobQueueTask"
  - slug: sync-careers
    schedule:
      crontab: "0 1 * * *"
      timezone: Pacific/Auckland
    marginSeconds: 120
    maxRuntimeSeconds: 3600
    command: "cd /container/application && vendor/bin/sake dev/tasks/SyncCareersDataTask w=1"
  - slug: sync-businesses
    schedule:
      crontab: "0 2 * * *"
      timezone: Pacific/Auckland
    marginSeconds: 120
    maxRuntimeSeconds: 3600
    command: "cd /container/application && vendor/bin/sake dev/tasks/SyncBusinessesDataTask w=1"
  - slug: sync-shopify
    schedule:
      crontab: "0 0,12 * * *"
      timezone: Pacific/Auckland
    marginSeconds: 120
    maxRuntimeSeconds: 3600
    command: "cd /container/application && vendor/bin/sake dev/tasks/SyncShopifyDataTask"
```

Pass a secret `TALARIA_API_KEY` into the deploy when the action registers monitors on `/v1/monitors/{slug}/check-ins`. Leave `TALARIA_URL` unset on Talaria Cloud. The action stores the monitor token on the container and re-applies the crontab after an image replacement. The token itself is only valid on `POST /v1/check-ins`.

## What opens an issue

| Status | When |
| --- | --- |
| `missed` | The slot plus `marginSeconds` passed with no `ok` |
| `timed_out` | `in_progress` ran longer than `maxRuntimeSeconds` |
| `error` | The job reported `error` |
| `overlap` | A second `in_progress` arrived while one was still open |

A later `ok` resolves the open issue. Check-ins are not billed. The miss, timeout, error, or overlap writes one event.

## Dashboard and MCP

The project **Monitors** page lists the schedule, timezone, last run, duration, and status. `list_monitors` answers whether a job ran before an issue exists. `get_issue` includes the monitor slug and a redacted log tail when the issue came from a check-in.
