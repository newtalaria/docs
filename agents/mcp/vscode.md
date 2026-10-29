---
title: VS Code and GitHub Copilot
description: >-
  Add the Talaria MCP server in VS Code and GitHub Copilot to access docs,
  investigation, and integration tools.
tags:
  - mcp
  - vscode
id: mcp-vscode
type: guide
section: agents
platform: []
feature: []
clients:
  - vscode
order: 103
lastReviewed: '2026-10-29'
owner: docs
---

# VS Code

## What you're setting up

VS Code and GitHub Copilot read MCP servers from `mcp.json`. The Talaria URL is `https://api.newtalaria.com/mcp`. The top-level key in the VS Code file is `servers`, and each HTTP server needs `"type": "http"`.

## Why use this

Do not paste the dashboard **Copy Cursor mcp.json** snippet into this file. That snippet uses `mcpServers` and has no `type`.

## Before you start

When the server returns HTTP 401 with `WWW-Authenticate`, VS Code opens a browser. Sign in to Talaria and allow install scopes (`mcp:read mcp:write mcp:keys`). A personal token from **Workspace › Integrations** is the fallback when OAuth stalls.

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Steps

### 1. Add the server

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

VS Code tries Streamable HTTP, then falls back to SSE. Talaria answers Streamable HTTP on `POST /mcp`.

A portable `.mcp.json` at the workspace root uses `mcpServers` instead of `servers`. If you use that file, still set `"type": "http"` and `url`.

Local API: `http://{{mcpUrl}}/mcp`.

## Check it worked

Command Palette → **MCP: List Servers** and confirm Talaria lists its tools. Call `get_connection` before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../add-talaria.md) and [Triage issues with an agent](../triage-issues.md).

## Troubleshooting

### Personal token (if OAuth stalls)

**Cause:** OAuth stalls.

**Fix:**

1. Dashboard **Workspace › Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
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

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`.

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Next steps

- [MCP overview](README.md)
