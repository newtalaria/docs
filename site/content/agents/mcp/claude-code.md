---
title: Claude Code
description: Add the Talaria MCP server to Claude Code over Streamable HTTP.
section: agents
order: 60
---

Claude Code speaks Streamable HTTP. An entry that has `url` and no `type` is skipped.

```bash
claude mcp add --transport http --scope user Talaria "https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true"
```

Or in config, `mcpServers` with `type: http` and `url`. `talaria mcp install` can write that form.

After connect, call `get_connection`. Use a URL without `?readonly=true` to install an SDK. Never send a `tal_pk_` or `tal_sk_` key as MCP auth.

See [MCP](/agents/mcp/) and [Add Talaria with an agent](/agents/add-talaria/).
