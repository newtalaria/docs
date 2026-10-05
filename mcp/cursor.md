---
title: Cursor
description: Add the Talaria MCP server in Cursor Settings and use it for install and production investigation.
tags: [mcp, cursor]
---

# Cursor

## Add the server

1. Open **Cursor Settings → MCP**.
2. Add Talaria at `https://api.newtalaria.com/mcp` (Streamable HTTP), or paste this into `~/.cursor/mcp.json`. This shape is Cursor's. Claude Code, VS Code, Codex, Gemini CLI, and Windsurf each use a different key — see [MCP](README.md).

   ```json
   {
     "mcpServers": {
       "Talaria": {
         "url": "https://api.newtalaria.com/mcp"
       }
     }
   }
   ```

3. Cursor requests `tools/list`, receives HTTP 401, and opens consent. Sign in to Talaria if needed, then **Allow** install scopes (`mcp:read mcp:write mcp:keys`).
4. After approve you should see the full tool catalogue (not only `docs_*`). Call `get_connection` and announce identity before creating projects or minting keys.

You can also copy the same file from the dashboard: **Settings → Integrations → Copy Cursor mcp.json (OAuth)**.

Local API: `http://localhost:8082/mcp`.

## Personal token (if OAuth stalls)

1. Dashboard **Settings → Integrations → Create personal MCP token**.
2. Prefer **Copy Cursor mcp.json** (shown once). Choose 30 days, 90 days, or until you revoke it. Or paste Bearer yourself:

   ```json
   {
     "mcpServers": {
       "Talaria": {
         "url": "https://api.newtalaria.com/mcp",
         "headers": {
           "Authorization": "Bearer YOUR_TOKEN"
         }
       }
     }
   }
   ```

3. The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`. Never use an ingest key (`tal_live_…`).

## Install Talaria into a repo

1. `docs_get` → `guides/add-talaria-with-an-agent`
2. Detect stack; `docs_search` / `docs_get` for the SDK hub (e.g. Flutter under `sdk/flutter`)
3. `get_connection` → announce user + org; ask before create
4. On yes: `setup_project` with `confirmed: true` (tracing + one-time key)
5. Wire SDK from docs (`talaria_flutter`, `runZonedApp`, `--dart-define=TALARIA_API_KEY`). The key decides the environment. Do not pass `environment` in init. `setup_project` returns a development key.
6. `send_test_event` → verify with `search_events` / `search_errors` and `environment: development`. `get_project_stats` `countsByEnvironment` is analytics volume and stays 0 when analytics is off.

Harness path for local Flutter install tests: `harnesses/mcp_flutter`.

## Investigate production

1. `get_projects`
2. `search_errors` with `environment: production` (the default once a production key exists) → `get_error`
3. Follow `traceId` / `sessionId` when present
4. Include `dashboardUrl` from tool results when citing an issue
5. When the failure is already fixed, follow [Triage issues with an agent](../guides/triage-issues-with-an-agent.md): `update_issue_status` with a note

## Related

- [MCP overview](README.md)
- [Configuration](../getting-started/configuration.md)
- [Flutter SDK](../sdk/flutter/README.md)
