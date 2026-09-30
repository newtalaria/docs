---
title: MCP
description: Hosted Talaria MCP for Cursor, Claude Code, and other Streamable HTTP clients.
tags: [mcp, agents]
---

# MCP

Hosted MCP at `https://api.newtalaria.com/mcp` (local: `http://localhost:8082/mcp`). Auth: OAuth or a personal token from **Settings → Integrations**. Never use ingest keys (`tal_live_…`).

## Tool catalogue

### Public (no org auth required)

| Tool | Purpose |
| ---- | ------- |
| `docs_list` | Manifest entries; filter by `sdk` / `prefix` |
| `docs_search` | Ranked search over title, path, tags, headings, body |
| `docs_get` | Full Markdown for a path/id |

For install tasks, start with `docs_get` on `guides/add-talaria-with-an-agent`.

### Authenticated (`mcp:read` and above)

| Tool | Purpose |
| ---- | ------- |
| `get_projects` | List org projects |
| `get_project` | Safe project settings (tracing/analytics/replay/heatmaps/sample rates) — no webhook secrets |
| `search_errors` / `get_error` | Grouped issues and detail |
| `search_events` / `get_event` | Event instances |
| `search_traces` / `get_trace` | Transactions / waterfalls |
| `search_sessions` | Product sessions |
| `get_project_stats` | Health snapshot |
| Feature flag tools | List / get / kill-switch / percent rollout |

### Elevated scopes

| Tool | Scope | Purpose |
| ---- | ----- | ------- |
| `update_project_settings` | `mcp:write` | Safe settings patch (consent-aware for analytics/heatmaps/replay) |
| `create_api_key` | `mcp:keys` | Mint ingest key once; never log or commit |

## Integration workflow

See [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md) and [Cursor](cursor.md).

## Investigation workflow

1. `get_projects` → real `projectId`
2. `search_errors` → `get_error`
3. Optional `get_trace` / `search_sessions`
4. Fix locally → verify with `search_events` / `get_project_stats`
