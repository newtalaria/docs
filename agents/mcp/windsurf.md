---
title: Windsurf
description: >-
  Add the Talaria MCP server in Windsurf to access docs, investigation, and
  integration tools.
tags:
  - mcp
  - windsurf
id: mcp-windsurf
type: guide
section: agents
platform: []
feature: []
clients:
  - windsurf
order: 106
lastReviewed: '2026-10-29'
owner: docs
---

# Windsurf

## What you're setting up

Windsurf Cascade reads MCP servers from `~/.codeium/windsurf/mcp_config.json` (Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`). Open it from the MCP toolbar → **Configure**. A remote server uses `serverUrl`.

## Why use this

The field `url` from a Cursor file does not connect. Talaria's published remote-HTTP path for Windsurf is a personal token in `headers`.

## Before you start

Create a personal token from **Workspace › Integrations**.

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Steps

### 1. Add the server

1. Dashboard **Workspace › Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
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

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`.

Config values in `serverUrl` and `headers` can interpolate `${env:NAME}` so the token stays out of the file.

Local API: `http://{{mcpUrl}}/mcp`.

## Check it worked

Confirm Talaria is connected in the MCP servers panel, then call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../add-talaria.md) and [Triage issues with an agent](../triage-issues.md).

## Troubleshooting

### A Cursor config does not connect

**Cause:** The field `url` from a Cursor file does not connect.

**Fix:** Use `serverUrl`, including the `/mcp` path, and a personal token in `headers`.

## Next steps

- [MCP overview](README.md)
