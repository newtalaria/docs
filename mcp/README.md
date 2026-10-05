---
title: MCP
description: Hosted Talaria MCP for Cursor, Claude Code, and other Streamable HTTP clients.
tags: [mcp, agents]
---

# MCP

Hosted MCP at `https://api.newtalaria.com/mcp` (local: `http://localhost:8082/mcp`). Transport is Streamable HTTP. Auth is OAuth (the client discovers `/.well-known/oauth-protected-resource`, registers at `/oauth/register`, and you approve consent) or a personal token from **Settings → Integrations**. Install scopes are `mcp:read mcp:write mcp:keys`. A personal token lasts 30 days, 90 days, or until you revoke it. It is opaque base64url JSON (one segment, not a three-part JWT). Never use an ingest key (`tal_live_…`).

`tools/list` requires a grant. `docs_*` tools/call still work without auth when called by name. After connect, call `get_connection` before mutating.

The dashboard button **Copy Cursor mcp.json** is the Cursor file. Other clients use a different key for the same URL. Pasting the Cursor file into Claude Code fails, because an entry with `url` and no `type` is skipped.

## Clients

| Client | Config key | Page |
| ------ | ---------- | ---- |
| Cursor | `mcpServers` → `url` | [Cursor](cursor.md) |
| Claude Code | `mcpServers` → `type: http` + `url` | [Claude Code](claude-code.md) |
| VS Code | `servers` → `type: http` + `url` | [VS Code](vscode.md) |
| Codex | `[mcp_servers.Talaria]` → `url` | [Codex](codex.md) |
| Gemini CLI | `mcpServers` → `httpUrl` | [Gemini CLI](gemini-cli.md) |
| Windsurf | `mcpServers` → `serverUrl` | [Windsurf](windsurf.md) |

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
| `search_errors` / `get_error` | Grouped issues and detail, including comments on `get_error`. `search_errors` takes `environment` |
| `search_events` / `get_event` | Event instances. `search_events` takes `environment` and `issueId`. `get_event` returns the rewritten JavaScript frame when a source map matches |
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
| `update_issue_status` / `add_issue_comment` | `mcp:write` | Resolve, ignore, or reopen one issue (a note is required to resolve or ignore, and is stored as a comment), or add a comment without changing status |
| `create_api_key` / `setup_project` | `mcp:keys` | Mint a key once; never log or commit. Omit `scopes` for the ingest key. `scopes: ["releases:write"]` is a second key for source-map upload. `setup_project` stays on the ingest key |

## Integration workflow

See [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md), [Triage issues with an agent](../guides/triage-issues-with-an-agent.md), and the client pages above.

## Environment on read tools

`search_errors`, `search_events`, `search_traces`, `list_suspect_spans`, `list_database_queries`, `search_sessions`, and `get_project_stats` take `environment`: `development`, `test`, `staging`, or `production`. The default is production when the project has a production key, otherwise development. An agent that just installed should query development. `get_project_stats` `countsByEnvironment` is analytics volume for each environment and stays 0 when analytics is off. Install success is `search_errors` or `search_events`.

`setup_project` mints a development key. Production shipping is a second key.

## Investigation workflow

1. `get_projects` → real `projectId`
2. `search_errors` (pass `environment`; use `development` right after install, `production` for a live failure) → `get_error`
3. A JavaScript frame that is still a hashed `*.js` file needs a source map for that release. Follow [Upload JavaScript source maps](../guides/upload-javascript-source-maps.md), then `get_event` or `get_source_map`.
4. Optional `get_trace` / `search_sessions` in the same environment
5. Fix locally → verify with `search_events` (`issueId` set) / `search_errors` on `development`
6. When the issue has stopped firing, `update_issue_status` to `resolved` with a note. Noise is `ignored` with a note. A later event with the same fingerprint reopens a resolved issue. An ignored issue reopens when the project's reopen-ignored setting is on (the default). `resolved` and `ignored` can only return to `open`.
