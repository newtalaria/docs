---
title: Flutter troubleshooting
description: Common Flutter integration mistakes and how to verify.
sdk: flutter
package: talaria_flutter
tags: [flutter, troubleshooting]
---

# Flutter troubleshooting

## No events in the dashboard

1. Confirm `TALARIA_API_KEY` / dart-define is set and not empty.
2. Confirm `dsn` is `https://ingest.newtalaria.com` (or your self-hosted API).
3. Restart after rotating a rejected key (failed auth is cached ~24h).
4. MCP: `get_project_stats` / `search_events` with the real project UUID from `get_projects`.

## Tracing spans missing

1. Enable tracing in **Project settings** (remote config). Init alone is not enough.
2. Wait for `getConfig` refresh (up to `ttlSeconds`, default ~5 minutes) or restart the app after saving settings.
3. Confirm you are not wrapping the Talaria ingest client.
4. Screen spans finish on idle — they are short by design.

## Analytics / heatmaps not firing

1. Enable analytics (and heatmaps) in Project settings.
2. Wire consent (`optIn` / project public analytics policy) as documented.
3. Heatmaps need `TalariaScreenCapture` in the widget tree.

## Claiming unsupported features

Do not enable or document browser **session replay** or **Web Vitals** as Flutter features.

## Related

- [Flutter hub](README.md)
- [Configuration](../../getting-started/configuration.md)
- [Agent playbook](../../guides/add-talaria-with-an-agent.md)
