---
title: Grok
description: Add the hosted Talaria MCP URL in the Grok client.
section: agents
order: 110
---

`talaria mcp install` cannot write a Grok config file, so it prints the URL. Add the hosted MCP in Grok as a Streamable HTTP server:

```
https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true
```

Auth is OAuth or a personal token from **Settings › Integrations**. API keys never work on `/mcp`. After connect, call `get_connection`.

See [MCP](/agents/mcp/).
