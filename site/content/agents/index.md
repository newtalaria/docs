---
title: MCP and agents
description: Add Talaria with an agent, connect the hosted MCP, and triage issues.
section: agents
order: 10
---

Point an agent at Talaria to install an SDK, investigate an issue, or read these docs.

- [Add Talaria with an agent](/agents/add-talaria/)
- [Triage issues](/agents/triage-issues/)
- [MCP overview](/agents/mcp/)

Connect your client to the hosted MCP at `https://api.newtalaria.com/mcp` with OAuth or a personal token. API keys never work on `/mcp`. URLs, scopes and tokens: [MCP](/agents/mcp/).

## Clients

| Client | Config | Page |
| --- | --- | --- |
| Cursor | `~/.cursor/mcp.json` → `mcpServers` → `url` | [Cursor](/agents/mcp/cursor/) |
| Claude Code | `claude mcp add --transport http` | [Claude Code](/agents/mcp/claude-code/) |
| VS Code | `.vscode/mcp.json` → `servers` → `type: http` + `url` | [VS Code](/agents/mcp/vscode/) |
| Codex | `codex mcp add --url` | [Codex](/agents/mcp/codex/) |
| Gemini CLI | `mcpServers` → `httpUrl` | [Gemini CLI](/agents/mcp/gemini-cli/) |
| Windsurf | `mcpServers` → `serverUrl` | [Windsurf](/agents/mcp/windsurf/) |
| Grok | Add the MCP URL in Grok | [Grok](/agents/mcp/grok/) |

`talaria mcp install` writes the URL form for Cursor, VS Code, Claude, Codex, and Gemini. It does not write Windsurf or Grok files. Clients that cannot do OAuth can run the stdio bridge:

```json
{ "command": "talaria", "args": ["mcp", "serve"] }
```

After connect, call `get_connection` before mutating. `search_docs` and `get_doc` can be called by name without org auth.

The dashboard **Fix with your agent** button hands off `talaria://issue/{id}` and the `talaria-fix-issue` prompt. Other prompts: `talaria-setup`, `talaria-verify-release`, `talaria-investigate-performance`.
