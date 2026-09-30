---
title: Add Talaria with an agent
description: Agent playbook — identity first, confirm before create, bootstrap key + first event, verify ingest.
tags: [agents, mcp, playbook]
---

# Add Talaria with an agent

Design centre: a developer connects Talaria MCP and says **“Add Talaria to this project.”** You combine local project context + these docs + live Talaria tools.

## Conversation script (follow in order)

### 1. Load this playbook and detect the stack

1. `docs_get` path `guides/add-talaria-with-an-agent` (public).
2. Inspect the local repo with IDE tools. Map the stack:

| Signal | Likely SDK |
| ------ | ---------- |
| Flutter | `talaria_flutter` → [sdk/flutter](../sdk/flutter/README.md) |
| Dart | `talaria` → [sdk/dart](../sdk/dart/README.md) |
| Serverpod | `talaria_serverpod` → [sdk/serverpod](../sdk/serverpod/README.md) |
| Next.js | `@newtalaria/nextjs` → [sdk/nextjs](../sdk/nextjs/README.md) |
| React | `@newtalaria/react` → [sdk/react](../sdk/react/README.md) |
| Node | `@newtalaria/node` → [sdk/node](../sdk/node/README.md) |
| Browser | `@newtalaria/browser` → [sdk/javascript](../sdk/javascript/README.md) |
| Laravel | `talaria/laravel` → [sdk/laravel](../sdk/laravel/README.md) |
| Silverstripe | `talaria/silverstripe` → [sdk/silverstripe](../sdk/silverstripe/README.md) |
| PHP | `talaria/talaria` → [sdk/php](../sdk/php/README.md) |

3. `docs_search` with `sdk` filter and query `install` / `init` / `bootstrap`, then `docs_get` the stack README and [configuration](../getting-started/configuration.md).

### 2. Authenticate and announce identity

1. If org tools fail with Unauthorized, run MCP auth / reconnect with install scopes (`mcp:read mcp:write mcp:keys`).
2. Call **`get_connection`** immediately after auth.
3. **Announce to the user** (mandatory, before any mutate):

> You’re connected as **{name}** (`{email}`) under organization **{orgName}**.  
> This connection can {install capabilities}.  
> You also belong to {otherOrganizations}. Wrong org? Say which to switch to. Wrong account? Disconnect Talaria MCP and sign in as the other user.

4. Wrong org → **`switch_organization`** with that `organizationId` → call `get_connection` again → re-announce.
5. Wrong account → stop mutating; tell them to reconnect MCP as the other Talaria user.

### 3. Ask before creating

1. Suggest a project name from the local app (e.g. package name / folder).
2. List existing projects from `get_connection.projects` or `get_projects`.
3. **Ask** (never auto-create):

> Create a new Talaria project named **{suggested}** in **{orgName}**, wire the SDK, mint an ingest key, and send a first test event?  
> Or reuse an existing project?

### 4. Bootstrap only after yes

1. On yes / reuse → **`setup_project`** with `confirmed: true` and either `name` or `projectId`. Prefer this over separate `create_project` + `create_api_key`.
2. Put the one-time `apiKey` only in env / `--dart-define` / ignored local config. Never commit `tal_live_…`. Do not echo the key later.
3. Edit the app from the SDK docs (dependency, init, framework hooks).
4. Call **`send_test_event`** on the real `projectId`.
5. Verify with `search_events` / `search_errors` / `get_project_stats`.
6. Close with the `dashboardUrl` and how to run the app with the key.

Do **not** claim “Talaria is wired” until step 5 returns the test event.

## App init vs Project settings

| In app init | In Project settings (remote `getConfig`) |
| ----------- | ---------------------------------------- |
| DSN / base URL | Tracing on/off + sample rate |
| API key | Analytics on/off |
| environment / release | Heatmaps on/off |
| minLevel, beforeSend, tags | Session replay on/off + rates |

`setup_project` enables tracing by default. Leave analytics / heatmaps / replay alone unless the user opts in with consent guidance.

Until remote config arrives, SDKs send **errors only**. Flutter does not support browser session replay.

## Production loop (after install)

1. `search_errors` → `get_error` → optional `get_trace` / `search_sessions`.
2. Fix code locally.
3. Instrument more using docs (`docs_search` for tracing/HTTP/analytics).
4. Re-verify with stats and search tools.

## Do not automate blindly

- Creating billing orgs / paying plans
- Committing ingest keys
- Creating projects or minting keys without announcing identity and asking first
- Enabling replay/analytics without consent guidance
- Claiming features the stack does not support (e.g. browser session replay on Flutter)
- Switching Talaria **accounts** via tools (reconnect MCP instead)
