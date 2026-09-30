---
title: Add Talaria with an agent
description: Agent playbook — detect stack, use docs_*, wire secrets safely, enable settings, verify ingest.
tags: [agents, mcp, playbook]
---

# Add Talaria with an agent

Design centre: a developer connects Talaria MCP and says **“Add Talaria to this project.”** You combine local project context + these docs + live Talaria tools.

## 1. Inspect the local project

Use IDE tools. Detect stack from:

| Signal | Likely SDK |
| ------ | ---------- |
| `pubspec.yaml` + Flutter SDK | `talaria_flutter` → [sdk/flutter](../sdk/flutter/README.md) |
| `pubspec.yaml` Dart only | `talaria` → Dart docs under `/docs/sdk/dart` (migrate into this repo next) |
| `serverpod.yaml` / Relic | `talaria_serverpod` |
| `package.json` + Next | `@newtalaria/nextjs` |
| `package.json` + React | `@newtalaria/react` |
| Node service | `@newtalaria/node` |
| Browser only | `@newtalaria/browser` |
| `composer.json` + Laravel | `talaria/laravel` |
| `composer.json` + Silverstripe | `talaria/silverstripe` |
| PHP | `talaria/talaria` |

## 2. Load canonical docs

1. `docs_search` with `sdk` filter and query `install` / `init` / `bootstrap`.
2. `docs_get` the stack README and [configuration](../getting-started/configuration.md).
3. Prefer this playbook (`guides/add-talaria-with-an-agent`) when the user asks to integrate.

## 3. Edit the application

- Add the package dependency and run the package manager.
- Copy initialization from the docs (env / dart-define for the key).
- Add framework hooks (Flutter navigator observer, middleware, etc.) from the docs.

> [!WARNING]
> Never invent or commit ingest secrets. Never paste `tal_live_…` into source control.

## 4. Project and API key

1. `get_projects` (requires MCP auth) — pick or ask which project.
2. Prefer: human creates a key in the dashboard and pastes into local env.
3. If the grant has `mcp:keys`, `create_api_key` returns the raw key **once**. Put it in env / CI secrets only.

## 5. App init vs Project settings

| In app init | In Project settings (remote `getConfig`) |
| ----------- | ---------------------------------------- |
| DSN / base URL | Tracing on/off + sample rate |
| API key | Analytics on/off |
| environment / release | Heatmaps on/off |
| minLevel, beforeSend, tags | Session replay on/off + rates |

Until remote config arrives, SDKs send **errors only**. Use `get_project` to read safe settings; `update_project_settings` (scope `mcp:write`) to enable features — and respect consent for analytics/heatmaps/replay.

## 6. Verify

1. Run the app / analyse / tests.
2. Trigger a known error or event.
3. MCP: `search_events`, `search_errors`, or `get_project_stats` on the real `projectId`.
4. Explain what changed and which settings remain human/consent decisions.

## 7. Production loop (after install)

1. `search_errors` → `get_error` → optional `get_trace` / `search_sessions`.
2. Fix code locally.
3. Instrument more using docs (`docs_search` for tracing/HTTP/analytics).
4. Re-verify with stats and search tools.

## Do not automate blindly

- Creating billing orgs / paying plans
- Committing ingest keys
- Enabling replay/analytics without consent guidance
- Claiming features the stack does not support (e.g. browser session replay on Flutter)
