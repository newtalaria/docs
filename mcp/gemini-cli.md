---
title: Gemini CLI
description: Add the Talaria MCP server in Gemini CLI with httpUrl, not url.
tags: [mcp, gemini-cli]
---

# Gemini CLI

Gemini CLI stores MCP servers in `settings.json` under `mcpServers`. For Streamable HTTP the field is `httpUrl`. The field `url` is an SSE endpoint. Talaria is Streamable HTTP at `https://api.newtalaria.com/mcp`.

## Add the server

```bash
gemini mcp add --transport http Talaria https://api.newtalaria.com/mcp
```

Or in `~/.gemini/settings.json` (user) or the project settings file:

```json
{
  "mcpServers": {
    "Talaria": {
      "httpUrl": "https://api.newtalaria.com/mcp"
    }
  }
}
```

Gemini CLI can complete OAuth for a remote HTTP server. Sign in to Talaria and **Allow** install scopes (`mcp:read mcp:write mcp:keys`) when a browser opens. Do not paste the dashboard **Copy Cursor mcp.json** snippet here: that file uses `url`, which Gemini CLI treats as SSE.

Local API: `http://localhost:8082/mcp`.

## Personal token (if OAuth stalls)

1. Dashboard **Settings → Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
2. Pass the header on the CLI, or set `headers` in settings.

```bash
gemini mcp add --transport http --header "Authorization: Bearer YOUR_TOKEN" Talaria https://api.newtalaria.com/mcp
```

```json
{
  "mcpServers": {
    "Talaria": {
      "httpUrl": "https://api.newtalaria.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`. Never use an ingest key (`tal_live_…`).

## After connect

Call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md) and [Triage issues with an agent](../guides/triage-issues-with-an-agent.md).

## Related

- [MCP overview](README.md)
