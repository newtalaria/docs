---
title: Codex
description: Add the Talaria MCP server to Codex.
section: agents
order: 80
---

```bash
codex mcp add Talaria --url "https://api.newtalaria.com/mcp/YOUR_ORG_ID/YOUR_PROJECT_ID?readonly=true"
```

The CLI writes a `url` field under `[mcp_servers.Talaria]`. A personal token, if needed, is a Bearer header — never a `tal_pk_` or `tal_sk_` key.

See [MCP](/agents/mcp/).
