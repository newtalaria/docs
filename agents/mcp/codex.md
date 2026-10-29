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

## What you're setting up

Codex reads Streamable HTTP MCP servers from `~/.codex/config.toml`. The field is `url`. A personal token comes from an environment variable.

## Why use this

Codex rejects an inline `bearer_token` in this file. The dashboard **Copy Cursor mcp.json** button is a different file. Do not paste it into `config.toml`.

## Before you start

If Codex opens a browser for OAuth, sign in to Talaria and allow install scopes (`mcp:read mcp:write mcp:keys`).

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Steps

### 1. Add the server

```toml
[mcp_servers.Talaria]
url = "https://api.newtalaria.com/mcp"
```

Local API: `http://{{mcpUrl}}/mcp`.

### 2. Personal token

1. Dashboard **Workspace › Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
2. Export the token in an environment variable you choose, then set `bearer_token_env_var` to that name. Restart Codex after the variable is set so the process can see it.

```toml
[mcp_servers.Talaria]
url = "https://api.newtalaria.com/mcp"
bearer_token_env_var = "YOUR_ENV_VAR"
```

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT.

## Check it worked

Call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../add-talaria.md) and [Triage issues with an agent](../triage-issues.md).

## Troubleshooting

### Codex rejects an inline token

**Cause:** Codex rejects an inline `bearer_token` in `config.toml`.

**Fix:** Do not write:

```toml
bearer_token = "YOUR_TOKEN"
```

Use `bearer_token_env_var` as in the personal-token step.

## Next steps

- [MCP overview](README.md)
