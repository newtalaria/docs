---
title: Quickstart
description: Create an account, project, and API key — send your first event and see the issue.
tags: [getting-started, quickstart]
---

# Quickstart

## Prerequisites

- A Talaria account at [one.newtalaria.com](https://one.newtalaria.com)
- An application you can run locally (Flutter, Dart, JS, PHP, …)

## Create a project and API key

1. Sign in to the [dashboard](https://one.newtalaria.com).
2. Create an organization (if needed) and a **project**.
3. Open the project → **API keys** → create a key with ingest scopes (default includes events and spans).
4. Copy the raw `tal_live_…` value **once**. Store it in a secret store or local env — never commit it.

## Pick an SDK

See the [SDK hub](../sdk/README.md). For Flutter, start at [Flutter SDK](../sdk/flutter/README.md).

## Wire init

Use the cloud ingest URL as `dsn` unless you self-host:

```text
https://ingest.newtalaria.com
```

Pass the API key from environment / `--dart-define` / `.env` — never hardcode.

## Enable optional features

Tracing, analytics, heatmaps, and session replay are controlled in **Project settings**, not only in app init. See [Project configuration](configuration.md).

## Verify

1. Trigger an error or send a test event from the app.
2. Open **Issues** in the dashboard, or use MCP `search_errors` / `search_events` / `get_project_stats`.

## Related

- [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md)
- [MCP](../mcp/README.md)
