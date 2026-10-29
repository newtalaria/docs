---
title: Project settings
description: >-
  Remote configuration: how SDKs load tracing, analytics, heatmaps, replay, and
  consent settings from your Talaria project.
tags:
  - configuration
  - remote-config
id: project-settings
navTitle: Project settings
type: concept
section: get-started
platform: []
feature: []
order: 30
lastReviewed: '2026-10-29'
owner: docs
---

# Project configuration

Official SDKs load tracing, analytics, heatmaps, and session replay from the project. You change those switches in the dashboard (or via MCP `update_project_settings` when authorized). **Init** keeps the API key and release. The API key decides the environment.

> [!WARNING]
> An agent that only edits app code cannot fully “turn on” tracing/analytics/replay. Project settings (remote config) must allow those features.

## How the SDK applies it

After init, the SDK calls:

```http
POST {dsn}/sdk/getConfig
```

with the project API key. The response is a read-only document. The SDK caches it and refreshes after `ttlSeconds` (default 300 seconds, clamped between one minute and one hour).

Until the first document arrives, the SDK sends **errors only**. Spans, analytics, heatmaps, and replay start only when the document allows them. Saving Project settings shows up on the next refresh.

- `active: false` is a normal cached document: the SDK sends nothing and refreshes on the same interval.
- A rejected key (not found, unauthorized, or a disallowed domain) is cached for 24 hours. Rotate the key and restart the process, or reload the page, to try again.
- PHP and JavaScript can set `remoteConfig: false`. That skips the fetch and sends errors only. **Dart always fetches.**

## Project settings

Open the project in the [dashboard](https://one.newtalaria.com) and edit **Project settings**, or read them with MCP `get_project`.

### Session replay

- Replay enabled
- Session sample rate (0–1)
- Error-linked sample rate (0–1)
- Mask all inputs

### Tracing and product signals

- Tracing enabled
- Traces sample rate (0–1). Successful transactions follow this rate. Error transactions stay at 100%.
- Analytics enabled
- Heatmaps enabled (needs analytics, and the same visitor consent)
- Slow query threshold (ms)

The server also applies the plan and organization analytics when it builds the document. Child spans are stored with the sampled root. Billing counts one transaction per started block of 25 spans in a trace, root and child spans together: a 9-span trace is 1 transaction and a 60-span trace is 3.

## What stays in init

Talaria Cloud ingest is `https://ingest.newtalaria.com`. Pass that URL as `url` unless the API is not Talaria Cloud.

Init still takes:

- API key
- [release / commit SHA](../guides/releases.md)
- tags
- minimum log level
- ignore lists
- `beforeSend`

Browser privacy options such as `blockSelector` and `maskAllInputs` stay on the client.

## Environment

The API key decides the environment. See [Environments and client keys](environments-and-client-keys.md).

## Consent

Analytics and heatmaps in Project settings allow the product to collect them. **Visitor consent is separate.** The browser SDK follows CookieYes, Cookiebot, and Google Consent Mode `analytics_storage` without extra code. That choice also holds or starts session replay. Error capture does not wait.

For any other banner, call `analytics.optIn()` after the visitor agrees, and `analytics.optOut()` to stop. A page with no banner can set `publicAnalytics: true` so the browser opts in when the project allows analytics. Leave that unset when a banner Talaria reads is on the page.

See [Cookie banners](../analytics/consent.md) and [Product analytics setup](../analytics/setup.md).

## Related

- [Quickstart](quickstart.md)
- [SDK hub](../sdk/README.md)
- [Agent playbook](../guides/add-talaria-with-an-agent.md)
