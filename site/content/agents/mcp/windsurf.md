---
title: Windsurf
description: Add the Talaria MCP server in Windsurf with serverUrl.
section: agents
order: 100
---

Windsurf Cascade reads MCP servers from `~/.codeium/windsurf/mcp_config.json` (Windows: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`). A remote server uses `serverUrl`. The `url` field from a Cursor file does not connect.

The Talaria CLI does not write this file (`talaria mcp install` has no Windsurf target). Add it yourself with a personal token:

```json
{
  "mcpServers": {
    "Talaria": {
      "serverUrl": "https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

`serverUrl` must include the `/mcp` path. Do not paste **Copy Cursor mcp.json**. Never use an API key.

See [MCP](/agents/mcp/).
