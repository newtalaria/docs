---
title: Cursor
description: Add the Talaria MCP server in Cursor Settings.
section: agents
order: 50
---

1. Open **Cursor Settings → MCP**.
2. Add Talaria as Streamable HTTP, or paste this into `~/.cursor/mcp.json`. This shape is Cursor's — other clients use a different key.

```json
{
  "mcpServers": {
    "Talaria": {
      "url": "https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true"
    }
  }
}
```

3. Cursor requests `tools/list`, receives HTTP 401, and opens consent. Allow `mcp:read mcp:setup mcp:operate`.
4. Call `get_connection` before creating projects or minting keys.

You can also copy the file from **Settings → Integrations → Copy Cursor mcp.json**. `talaria mcp install` writes the same URL form. Do not paste this file into Claude Code (an entry with `url` and no `type` is skipped).

A personal token, if OAuth stalls, goes in `headers.Authorization` as `Bearer` plus the token. Never use an API key.

Then follow [Add Talaria with an agent](/agents/add-talaria/) or [Triage issues](/agents/triage-issues/).
