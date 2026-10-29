---
title: Codex
description: >-
  Add the Talaria MCP server in Codex to access docs, investigation, and
  integration tools.
tags:
  - mcp
  - codex
id: mcp-codex
type: guide
section: agents
platform: []
feature: []
clients:
  - codex
order: 104
lastReviewed: '2026-10-29'
owner: docs
---

# Codex

Codex reads Streamable HTTP MCP servers from `~/.codex/config.toml`. The field is `url`. A personal token comes from an environment variable. Codex rejects an inline `bearer_token` in this file.

## Add the server

```toml
[mcp_servers.Talaria]
url = "https://api.newtalaria.com/mcp"
```

Local API: `http://{{mcpUrl}}/mcp`.

If Codex opens a browser for OAuth, sign in to Talaria and **Allow** install scopes (`mcp:read mcp:write mcp:keys`). The dashboard **Copy Cursor mcp.json** button is a different file. Do not paste it into `config.toml`.

## Personal token

1. Dashboard **Settings → Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
2. Export the token, then point Codex at the variable name. Restart Codex after the variable is set so the process can see it.

```bash
export TALARIA_MCP_TOKEN='YOUR_TOKEN'
```

```toml
[mcp_servers.Talaria]
url = "https://api.newtalaria.com/mcp"
bearer_token_env_var = "TALARIA_MCP_TOKEN"
```

Do not write:

```toml
bearer_token = "YOUR_TOKEN"
```

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. Never send an API key or a monitor token to MCP.

## After connect

Call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../add-talaria.md) and [Triage issues with an agent](../triage-issues.md).

## Related

- [MCP overview](README.md)
