---
title: Gemini CLI
description: >-
  Add the Talaria MCP server in Gemini CLI to access docs, investigation, and
  integration tools.
tags:
  - mcp
  - gemini-cli
id: mcp-gemini-cli
type: guide
section: agents
platform: []
feature: []
clients:
  - gemini-cli
order: 105
lastReviewed: '2026-10-29'
owner: docs
---

# Gemini CLI

## What you're setting up

Gemini CLI stores MCP servers in `settings.json` under `mcpServers`. For Streamable HTTP the field is `httpUrl`. The field `url` is an SSE endpoint. Talaria is Streamable HTTP at `https://api.newtalaria.com/mcp`.

## Why use this

Do not paste the dashboard **Copy Cursor mcp.json** snippet here: that file uses `url`, which Gemini CLI treats as SSE.

## Before you start

Gemini CLI can complete OAuth for a remote HTTP server. Sign in to Talaria and allow install scopes (`mcp:read mcp:write mcp:keys`) when a browser opens. A personal token from **Workspace › Integrations** is the fallback when OAuth stalls.

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Steps

### 1. Add the server

```bash
gemini mcp add --transport http Talaria https://api.newtalaria.com/mcp
```

Or in `~/.gemini/settings.json` (user) or the project settings file:

```json
{
  "mcpServers": {
    "Talaria": {
      "httpUrl": "https://api.newtalaria.com/mcp"
    }
  }
}
```

## Check it worked

Call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow [Add Talaria with an agent](../add-talaria.md) and [Triage issues with an agent](../triage-issues.md).

## Troubleshooting

### Personal token (if OAuth stalls)

**Cause:** OAuth stalls.

**Fix:**

1. Dashboard **Workspace › Integrations → Create personal token**. Choose 30 days, 90 days, or until you revoke it.
2. Pass the header on the CLI, or set `headers` in settings.

```bash
gemini mcp add --transport http --header "Authorization: Bearer YOUR_TOKEN" Talaria https://api.newtalaria.com/mcp
```

```json
{
  "mcpServers": {
    "Talaria": {
      "httpUrl": "https://api.newtalaria.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. One space after `Bearer`.

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Next steps

- [MCP overview](README.md)
