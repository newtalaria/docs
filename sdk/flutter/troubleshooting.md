---
title: Flutter troubleshooting
description: >-
  Common Flutter integration mistakes and how to verify Talaria is working
  correctly.
package: talaria_flutter
tags:
  - flutter
  - troubleshooting
id: flutter-troubleshooting
navTitle: Troubleshooting
type: troubleshooting
section: platforms
platform:
  - flutter
feature: []
order: 60
lastReviewed: '2026-10-29'
owner: docs
---

# Flutter troubleshooting

## No events in the dashboard

1. Confirm `TALARIA_API_KEY` / dart-define is set and not empty.
2. Confirm `url` is `https://ingest.newtalaria.com` (or your self-hosted API).
3. Restart after rotating a rejected key (failed auth is cached ~24h).
4. MCP: `get_project_stats` / `search_events` with the real project UUID from `list_projects`.

## Tracing spans missing

1. Enable tracing in **Project settings** (remote config). Init alone is not enough.
2. Wait for project configuration refresh (up to `ttlSeconds`, default ~5 minutes) or restart the app after saving settings.
3. Confirm you are not wrapping the Talaria ingest client.
4. Screen spans finish on idle. They are short by design. See [Instrumentation and tracing](tracing.md).

## Analytics / heatmaps not firing

1. Enable analytics (and heatmaps) in Project settings.
2. Call `Talaria.analytics.optIn()` after the person agrees. This package does not read a web cookie banner.
3. Heatmaps need `TalariaScreenCapture` in the widget tree. See [Navigation and screens](navigation.md).

## Related

- [Flutter hub](README.md)
- [Instrumentation and tracing](tracing.md)
- [Best practices](configuration.md)
- [Configuration](../../get-started/project-settings.md)
- [Agent playbook](../../agents/add-talaria.md)
