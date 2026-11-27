---
title: Gemini CLI
description: Add the Talaria MCP server to Gemini CLI over Streamable HTTP.
section: agents
order: 90
---

Gemini CLI stores MCP servers in `settings.json` under `mcpServers`. For Streamable HTTP the field is `httpUrl`. The field `url` is an SSE endpoint and is the wrong shape for Talaria.

```bash
gemini mcp add --transport http Talaria "https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true"
```

`talaria mcp install` writes the URL form. Never use an API key for MCP auth.

See [MCP](/agents/mcp/).
