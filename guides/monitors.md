# Job monitors

A monitor is a schedule Talaria expects to hear from. A cron line, a Kubernetes CronJob, or the SiteHost probe sends `in_progress`, then `ok` or `error`. When the slot plus its margin passes with no `ok`, Talaria opens one issue.

Check-ins use a project API key with the `monitors:write` scope, or a per-monitor ping token. The token is for a crontab that must not contain the API key.

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

Register the schedule once with the API key. The response includes `pingToken` a single time. Store it outside the repository.

```bash
curl -fsS -X POST "$TALARIA_DSN/monitors/ping" \
  -H "X-Monitor-Token: $TALARIA_PING_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"ok"}'
```

`status` is `in_progress`, `ok`, or `error`. Optional fields are `checkInId`, `durationSeconds`, and `logTail`.

The SiteHost deploy action writes these lines when the app contains `talaria/sitehost/monitors.json`:

```json
{
  "jobs": [
    {
      "slug": "process-job-queue",
      "crontab": "* * * * *",
      "timezone": "Pacific/Auckland",
      "marginSeconds": 120,
      "maxRuntimeSeconds": 55,
      "command": "cd /container/application && vendor/bin/sake dev/tasks/ProcessJobQueueTask"
    },
    {
      "slug": "sync-careers",
      "crontab": "0 1 * * *",
      "timezone": "Pacific/Auckland",
      "marginSeconds": 120,
      "maxRuntimeSeconds": 3600,
      "command": "cd /container/application && vendor/bin/sake dev/tasks/SyncCareersDataTask w=1"
    },
    {
      "slug": "sync-businesses",
      "crontab": "0 2 * * *",
      "timezone": "Pacific/Auckland",
      "marginSeconds": 120,
      "maxRuntimeSeconds": 3600,
      "command": "cd /container/application && vendor/bin/sake dev/tasks/SyncBusinessesDataTask w=1"
    },
    {
      "slug": "sync-shopify",
      "crontab": "0 0,12 * * *",
      "timezone": "Pacific/Auckland",
      "marginSeconds": 120,
      "maxRuntimeSeconds": 3600,
      "command": "cd /container/application && vendor/bin/sake dev/tasks/SyncShopifyDataTask"
    }
  ]
}
```

Pass `TALARIA_DSN` and `TALARIA_API_KEY` into the deploy. The action stores the ping token on the container and re-applies the crontab after an image replacement.

## What opens an issue

| Status | When |
| --- | --- |
| `missed` | The slot plus `marginSeconds` passed with no `ok` |
| `timed_out` | `in_progress` ran longer than `maxRuntimeSeconds` |
| `error` | The job reported `error` |
| `overlap` | A second `in_progress` arrived while one was still open |

A later `ok` resolves the open issue. Check-ins are not billed. The miss, timeout, error, or overlap writes one event.

## Dashboard and MCP

The project **Monitors** page lists the schedule, timezone, last run, duration, and status. `list_monitors` answers whether a job ran before an issue exists. `get_error` includes the monitor slug and a redacted log tail when the issue came from a check-in.
