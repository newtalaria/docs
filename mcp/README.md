---
title: MCP
description: Hosted Talaria MCP for Cursor, Claude Code, and other Streamable HTTP clients.
tags: [mcp, agents]
---

# MCP

Hosted MCP at `https://api.newtalaria.com/mcp` (local: `http://localhost:8082/mcp`). Auth: OAuth (preferred — Cursor challenges when listing tools) or a personal token from **Settings → Integrations** (install scopes by default). Personal tokens are opaque base64url JSON (not three-part JWTs). Never use ingest keys (`tal_live_…`).

`tools/list` requires a grant. `docs_*` tools/call still work without auth when called by name. After connect, call `get_connection` before mutating.

## Tool catalogue

### Public by name (no org auth on `tools/call`)

| Tool | Purpose |
| ---- | ------- |
| `docs_list` | Manifest entries; filter by `sdk` / `prefix` |
| `docs_search` | Ranked search over title, path, tags, headings, body |
| `docs_get` | Full Markdown for a path/id |

For install tasks, start with `docs_get` on `guides/add-talaria-with-an-agent`.

### Authenticated (`mcp:read` and above)

| Tool | Purpose |
| ---- | ------- |
| `get_connection` | Announce signed-in user, org, and capabilities |
| `switch_organization` | Move the grant to another org you belong to |
| `get_projects` | List org projects |
| `get_project` | Safe project settings (tracing/analytics/replay/heatmaps/sample rates) — no webhook secrets |
| `search_errors` / `get_error` | Grouped issues and detail. `search_errors` takes `environment` |
| `search_events` / `get_event` | Event instances. `search_events` takes `environment`. `get_event` returns the rewritten JavaScript frame when a source map matches |
| `get_source_map` | Original source window for one stored frame (`eventId`, `frameIndex`). `mapped: false` includes the `fileName` still to upload |
| `search_traces` / `get_trace` | Transactions / waterfalls. `search_traces` takes `environment`. Set `grouped: true` and `sort` (`count`, `p95`, `impact`, `errorRate`) for one row per transaction name with count, error count, p50, and p95 |
| `list_suspect_spans` | Child spans with the highest p95 in the window. Takes `environment` |
| `list_database_queries` | Database statements grouped by text: calls, total time, p95, errors, and N+1 trace count. `nPlusOneOnly` keeps N+1 statements. Takes `environment` |
| `search_sessions` | Product sessions. Takes `environment` |
| `get_project_stats` | Health snapshot for one environment, plus per-environment counts. Takes `environment` |
| Feature flag tools | List / get / kill-switch / percent rollout. One flag definition per project; evaluation uses the ingest key's environment |

### Elevated scopes

| Tool | Scope | Purpose |
| ---- | ----- | ------- |
| `update_project_settings` / `create_project` / `send_test_event` | `mcp:write` | Safe settings, create project, ingest a test event |
| `create_api_key` / `setup_project` | `mcp:keys` | Mint a key once; never log or commit. Omit `scopes` for the ingest key. `scopes: ["releases:write"]` is a second key for source-map upload. `setup_project` stays on the ingest key |

## Integration workflow

See [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md) and [Cursor](cursor.md).

## Environment on read tools

`search_errors`, `search_events`, `search_traces`, `list_suspect_spans`, `list_database_queries`, `search_sessions`, and `get_project_stats` take `environment`: `development`, `test`, `staging`, or `production`. The default is production when the project has a production key, otherwise development. An agent that just installed should query development. `get_project_stats` `countsByEnvironment` is analytics volume for each environment and stays 0 when analytics is off. Install success is `search_errors` or `search_events`.

`setup_project` mints a development key. Production shipping is a second key.

## Investigation workflow

1. `get_projects` → real `projectId`
2. `search_errors` (pass `environment`; use `development` right after install, `production` for a live failure) → `get_error`
3. A JavaScript frame that is still a hashed `*.js` file needs a source map for that release. Follow [Upload JavaScript source maps](../guides/upload-javascript-source-maps.md), then `get_event` or `get_source_map`.
4. Optional `get_trace` / `search_sessions` in the same environment
5. Fix locally → verify with `search_events` / `search_errors` on `development`
