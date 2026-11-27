---
title: Monitors
description: Register a cron or job monitor, check in with a tal_mon_ token, and watch missed or failed runs.
section: guides
order: 110
---

A monitor is a heartbeat for a scheduled job. You register the monitor once with a secret key, store the check-in token, and have the job call in when it starts and when it finishes.

## Register

`POST /v1/monitors/{slug}/check-ins` on `https://ingest-nz1.newtalaria.com` needs a secret key with `monitors:write`. The JSON response includes `monitorToken` **once**. Save it as a `tal_mon_…` token. Official SDKs refuse that token as an init key.

The PHP SDK registers the run, sends `in_progress`, runs your callback, then sends `ok` or `error` and flushes before the process exits:

```php
Talaria::monitor('nightly-backup', [
    'crontab' => '0 2 * * *',
    'timezone' => 'Pacific/Auckland',
    'maxRuntimeSeconds' => 3600,
], function () {
    // the job
});
```

The second argument is the schedule: `crontab` or `intervalSeconds`, plus optional `timezone`, `marginSeconds`, and `maxRuntimeSeconds`. See the [PHP SDK](/sdk/php/).

## Check in

Later pings go to `POST /v1/check-ins` with `Authorization: Bearer` and the `tal_mon_…` token. Do not send a project API key to this route, and do not send a monitor token to MCP or to SDK `init`.

The body is a JSON object. Status is one of `in_progress`, `ok`, or `error`. Optional fields include `runId`, `durationSeconds`, and `logTail`.

```bash
curl -sS https://ingest-nz1.newtalaria.com/v1/check-ins \
  -H "Authorization: Bearer tal_mon_…" \
  -H "Content-Type: application/json" \
  -d '{"status":"ok","runId":"2026-11-27-nightly"}'
```

Mark a long job `in_progress` when it starts and `ok` or `error` when it finishes.

## What the server records

Besides the statuses you send, the server can mark a run `missed`, `timedOut`, `overlap`, or `error` when the schedule is not met. Open **Monitors** in the [dashboard](https://one.newtalaria.com) to inspect recent check-ins.

MCP can list monitors with `list_monitors` after you [connect](/agents/mcp/).

## SiteHost

The Silverstripe SiteHost installer reads `talaria/sitehost/monitors.json` and reconciles one crontab block plus the supervisord probe. Run `vendor/bin/talaria-sitehost install`. Full steps: [SiteHost containers](/guides/collectors/sitehost/).

## Related

- [Ingest API](/reference/ingest-api/)
- [Environments and API keys](/get-started/environments-and-api-keys/)
- [CLI](/cli/)
