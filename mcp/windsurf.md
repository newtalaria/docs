---
title: Windsurf
description: Add the Talaria MCP server in Windsurf mcp_config.json with serverUrl.
tags: [mcp, windsurf]
---

# Windsurf

Windsurf Cascade reads MCP servers from `~/.codeium/windsurf/mcp_config.json` (Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`). Open it from the MCP toolbar → **Configure**. A remote server uses `serverUrl`. The field `url` from a Cursor file does not connect.

## Add the server

Talaria's published remote-HTTP path for Windsurf is a personal token in `headers`.

1. Dashboard **Settings → Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
2. Add Talaria and refresh the MCP toolbar:

```json
{
  "mcpServers": {
    "Talaria": {
      "serverUrl": "https://api.newtalaria.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

`serverUrl` must include the `/mcp` path. Do not paste the dashboard **Copy Cursor mcp.json** snippet: that file uses `url` and has no `serverUrl`.

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`. Never use an ingest key (`tal_live_…`).

Config values in `serverUrl` and `headers` can interpolate `${env:TALARIA_MCP_TOKEN}` so the token stays out of the file.

Local API: `http://localhost:8082/mcp`.

## After connect

Confirm Talaria is connected in the MCP servers panel, then call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md) and [Triage issues with an agent](../guides/triage-issues-with-an-agent.md).

## Related

- [MCP overview](README.md)
