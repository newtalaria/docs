---
title: Claude Code
description: >-
  Add the Talaria MCP server in Claude Code to access docs, investigation, and
  integration tools.
tags:
  - mcp
  - claude-code
id: mcp-claude-code
type: guide
section: agents
platform: []
feature: []
clients:
  - claude-code
order: 102
lastReviewed: '2026-10-29'
owner: docs
---

# Claude Code

Claude Code speaks Streamable HTTP. The Talaria URL is `https://api.newtalaria.com/mcp`. An entry that has `url` and no `type` is skipped: Claude Code reads that shape as a local stdio server.

## Add the server

From a terminal, outside a Claude Code session:

```bash
claude mcp add --transport http --scope user Talaria https://api.newtalaria.com/mcp
```

`--scope user` registers Talaria for every project. Omit it to keep the server in the current project only. Then run `claude mcp list` and confirm Talaria is connected. Claude Code starts OAuth when the server answers `tools/list` with HTTP 401. Sign in to Talaria and **Allow** install scopes (`mcp:read mcp:write mcp:keys`).

The same entry in `.mcp.json` (project) or the user config:

```json
{
  "mcpServers": {
    "Talaria": {
      "type": "http",
      "url": "https://api.newtalaria.com/mcp"
    }
  }
}
```

`type` may be `streamable-http`. It may not be omitted.

Local API: `http://{{mcpUrl}}/mcp`.

## Personal token (if OAuth stalls)

1. Dashboard **Settings → Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
2. Add the header. The dashboard **Copy Cursor mcp.json** button is the Cursor file and is missing `type`, so do not paste it here.

```bash
claude mcp add --transport http --scope user Talaria https://api.newtalaria.com/mcp \
  --header "Authorization: Bearer YOUR_TOKEN"
```

```json
{
  "mcpServers": {
    "Talaria": {
      "type": "http",
      "url": "https://api.newtalaria.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`. Never send an API key or a monitor token to MCP.

## After connect

Call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../add-talaria.md) and [Triage issues with an agent](../triage-issues.md).

## Related

- [MCP overview](README.md)
- [Cursor](cursor.md)
