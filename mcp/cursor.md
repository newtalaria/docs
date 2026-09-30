---
title: Cursor
description: Add the Talaria MCP server in Cursor Settings and use it for install and production investigation.
tags: [mcp, cursor]
---

# Cursor

## Add the server

1. Open **Cursor Settings → MCP**.
2. Add the Talaria server URL: `https://api.newtalaria.com/mcp` (Streamable HTTP).
3. Prefer OAuth with your Talaria account, or paste a personal token from **Settings → Integrations → Cursor**.
4. Never use an ingest key (`tal_live_…`).

Local API: `http://localhost:8082/mcp`.

## Install Talaria into a repo

1. `docs_get` → `guides/add-talaria-with-an-agent`
2. Detect stack; `docs_search` / `docs_get` for the SDK hub
3. Edit deps and init from docs
4. `get_projects` → key via dashboard or `create_api_key` (`mcp:keys`)
5. Enable tracing/analytics via dashboard or `update_project_settings` (`mcp:write`)
6. Verify with `search_events` / `get_project_stats`

## Investigate production

1. `get_projects`
2. `search_errors` → `get_error`
3. Follow `traceId` / `sessionId` when present
4. Include `dashboardUrl` from tool results when citing an issue

## Related

- [MCP overview](README.md)
- [Configuration](../getting-started/configuration.md)
- [Flutter SDK](../sdk/flutter/README.md)
