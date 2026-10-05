---
title: VS Code
description: Add the Talaria MCP server in VS Code mcp.json with type http.
tags: [mcp, vscode]
---

# VS Code

VS Code and GitHub Copilot read MCP servers from `mcp.json`. The Talaria URL is `https://api.newtalaria.com/mcp`. The top-level key in the VS Code file is `servers`, and each HTTP server needs `"type": "http"`.

## Add the server

1. Command Palette → **MCP: Add Server**, or **MCP: Open User Configuration** for every workspace, or create `.vscode/mcp.json` for one workspace.
2. Use this shape:

```json
{
  "servers": {
    "Talaria": {
      "type": "http",
      "url": "https://api.newtalaria.com/mcp"
    }
  }
}
```

VS Code tries Streamable HTTP, then falls back to SSE. Talaria answers Streamable HTTP on `POST /mcp`. When the server returns HTTP 401 with `WWW-Authenticate`, VS Code opens a browser. Sign in to Talaria and **Allow** install scopes (`mcp:read mcp:write mcp:keys`).

Do not paste the dashboard **Copy Cursor mcp.json** snippet into this file. That snippet uses `mcpServers` and has no `type`.

A portable `.mcp.json` at the workspace root uses `mcpServers` instead of `servers`. If you use that file, still set `"type": "http"` and `url`.

Local API: `http://localhost:8082/mcp`.

## Personal token (if OAuth stalls)

1. Dashboard **Settings → Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
2. Put the bearer in `headers`. VS Code can prompt for it with `${input:talaria-mcp-token}` so the token stays out of the file you commit.

```json
{
  "servers": {
    "Talaria": {
      "type": "http",
      "url": "https://api.newtalaria.com/mcp",
      "headers": {
        "Authorization": "Bearer ${input:talaria-mcp-token}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "talaria-mcp-token",
      "description": "Talaria personal MCP token",
      "password": true
    }
  ]
}
```

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`. Never use an ingest key (`tal_live_…`).

## After connect

Command Palette → **MCP: List Servers** and confirm Talaria lists its tools. Call `get_connection` before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md) and [Triage issues with an agent](../guides/triage-issues-with-an-agent.md).

## Related

- [MCP overview](README.md)
