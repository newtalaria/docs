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

MCP uses **OAuth** or a **personal token** from **Settings → Integrations**. API keys (`tal_pk_…` or `tal_sk_…`) never work on `/mcp`. A personal token lasts 30 days, 90 days, or until you revoke it. Treat it as a secret. Install scopes are `mcp:read mcp:setup mcp:operate`; `mcp:keys` is off by default (add it only when the agent must handle secret or collector keys).

Hosted URL: `https://api.newtalaria.com/mcp`. Transport is Streamable HTTP. The default protocol is `2026-07-28`. The dashboard and these snippets use the read-only project-scoped URL:

```
https://api.newtalaria.com/mcp/{org}/{project}?readonly=true
```

`{org}` and `{project}` are the UUIDs shown in **Settings → Integrations**. Drop `?readonly=true` if the agent must install the SDK (`setup_project`, `create_api_key`, `send_test_event`) or change issues. See [scoped URLs](/agents/mcp/#scoped-urls).

## Clients

| Client | Config | Page |
| --- | --- | --- |
| Cursor | `~/.cursor/mcp.json` → `mcpServers` → `url` | [Cursor](/agents/mcp/cursor/) |
| Claude Code | `claude mcp add --transport http` | [Claude Code](/agents/mcp/claude-code/) |
| VS Code | `.vscode/mcp.json` → `servers` → `type: http` + `url` | [VS Code](/agents/mcp/vscode/) |
| Codex | `codex mcp add --url` | [Codex](/agents/mcp/codex/) |
| Gemini CLI | `mcpServers` → `httpUrl` | [Gemini CLI](/agents/mcp/gemini-cli/) |
| Windsurf | `mcpServers` → `serverUrl` | [Windsurf](/agents/mcp/windsurf/) |
| Grok | Add the MCP URL in the Grok client (no confirmed config file in the CLI) | [Grok](/agents/mcp/grok/) |

`talaria mcp install` writes the URL form for Cursor, VS Code, Claude, Codex, and Gemini. It does not write Windsurf or Grok files. Clients that cannot do OAuth can run the stdio bridge:

```json
{ "command": "talaria", "args": ["mcp", "serve"] }
```

After connect, call `get_connection` before mutating. `search_docs` and `get_doc` can be called by name without org auth.

The dashboard **Fix with your agent** button hands off `talaria://issue/{id}` and the `talaria-fix-issue` prompt. Other prompts: `talaria-setup`, `talaria-verify-release`, `talaria-investigate-performance`.
