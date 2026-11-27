---
title: Grok
description: Add the hosted Talaria MCP URL in the Grok client.
section: agents
order: 110
---

The CLI has no confirmed Grok config path. `talaria mcp install` prints the URL only. Add the hosted MCP in the Grok client as Streamable HTTP:

```
https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true
```

Auth is OAuth or a personal token from **Settings → Integrations**. API keys never work on `/mcp`. After connect, call `get_connection`.

See [MCP](/agents/mcp/).
