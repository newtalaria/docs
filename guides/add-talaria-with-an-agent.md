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

1. On yes / reuse → **`setup_project`** with `confirmed: true` and either `name` or `projectId`. Prefer this over separate `create_project` + `create_api_key`. This mints a **development** key. Production shipping is a second key, created when someone is actually shipping.
2. Put the one-time `apiKey` only in env / `--dart-define` / ignored local config. Never commit `tal_live_…`. Do not echo the key later. The key decides the environment. Do not pass `environment` in SDK init.
3. Edit the app from the SDK docs (dependency, init, framework hooks). Local runs still send a version or SHA as `release`.
4. Call **`send_test_event`** on the real `projectId`.
5. Verify with `search_events` / `search_errors`, passing `environment: development`. A just-installed project has no production key, and these tools default to development in that case; pass `development` anyway so a later production key does not hide the local traffic. Install success is `search_errors` or `search_events` on development. `get_project_stats` `countsByEnvironment` is analytics volume and stays 0 when analytics is off.
6. Close with the `dashboardUrl` and how to run the app with the key. The dashboard shell reads one environment at a time and defaults to production when a production key exists, otherwise development. Switch to Development to see this install.

Do **not** claim “Talaria is wired” until step 5 returns the test event.

### 5. Source maps for browser, React, and Next

After init, a minified stack stays minified until maps are uploaded for the same release.

1. `docs_get` path `guides/upload-javascript-source-maps` (command reference: `sdk/javascript/source-maps`).
2. Set `Talaria.init({ release: 'local' })` for a local run, or the git SHA in CI. The release string on events must match the upload.
3. Ask before minting a second key. Call `create_api_key` with `scopes: ["releases:write"]` and a name like `source maps`. Do not add that scope to the browser key from `setup_project`.
4. Put the raw key only in `TALARIA_RELEASE_KEY`. Then run `npx talaria sourcemaps upload ./dist` (local default is `http://localhost:8080` and release `local`).
5. Open the event with `get_event`. If a frame is still a hashed `*.js` file, call `get_source_map` and upload the `fileName` it returns.

## App init vs Project settings

| In app init | In Project settings (remote `getConfig`) |
| ----------- | ---------------------------------------- |
| DSN / base URL | Tracing on/off + sample rate |
| API key (this chooses the environment) | Analytics on/off |
| release (version or SHA) | Heatmaps on/off |
| minLevel, beforeSend, tags | Session replay on/off + rates |

`setup_project` enables tracing by default. Leave analytics / heatmaps / replay alone unless the user opts in with consent guidance.

Until remote config arrives, SDKs send **errors only**. Flutter does not support browser session replay.

## Production loop (after install)

1. `search_errors` with `environment: production` (the default once a production key exists) → `get_error` → optional `get_trace` / `search_sessions` in that same environment.
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
