---
title: Quickstart
description: >-
  Create an account, project, and API key—send your first event in under 5
  minutes.
tags:
  - getting-started
  - quickstart
id: quickstart
type: quickstart
section: get-started
platform: []
feature: []
order: 15
lastReviewed: '2026-10-29'
owner: docs
---

# Quickstart

## Prerequisites

- A Talaria account at [one.newtalaria.com](https://one.newtalaria.com)
- An application you can run locally (Flutter, Dart, JS, PHP, …)

## Create a project and API key

1. Sign in to the [dashboard](https://one.newtalaria.com).
2. Create an organisation (if needed) and a **project**.
3. Open **Project settings › API keys** and create a key. The prefix shows its environment (`tal_pk_dev_nz1_…` for local).
4. Copy the raw `tal_pk_dev_nz1_…` value **once** (shown only at creation). It is a **public client ingest credential** — pass it via env / `--dart-define` / `.env` as you prefer. The key decides the environment. SDKs do not send it.

## Pick an SDK

See the [SDK hub](../sdk/README.md). For Flutter, start at [Flutter SDK](../sdk/flutter/README.md).

## Wire init

Use the cloud ingest URL as `url` unless you self-host:

```text
https://ingest-nz1.newtalaria.com
```

Pass the API key from environment / `--dart-define` / `.env`, or embed it in the client — `tal_pk_prod_nz1_…` / `tal_pk_dev_nz1_…` keys are designed to be public. See [Environments and API keys](environments-and-api-keys.md) for key prefixes.

## Enable optional features

Tracing, analytics, heatmaps, and session replay are controlled in **Project settings**, not only in app init. See [Project settings](project-settings.md).

## Verify

1. Trigger an error or send a test event from the app.
2. Open **Issues** in the dashboard on the key's environment, or use MCP `search_issues` / `get_project`. After a local install with a development key (`tal_pk_dev_nz1_…`), select the Development environment in the dashboard.

## Related

- [Add Talaria with an agent](../agents/add-talaria.md)
- [MCP](../agents/mcp/README.md)
