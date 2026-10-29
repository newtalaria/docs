---
title: Grok Bot
description: >-
  Add the Talaria MCP server in Grok Bot to access docs, investigation, and
  integration tools.
tags:
  - mcp
  - grok
  - grok-bot
id: mcp-grok-bot
type: guide
section: agents
platform: []
feature: []
clients:
  - grok-bot
order: 101
lastReviewed: '2026-10-29'
owner: docs
---

# Grok Bot

## What you're setting up

Custom MCP chat prompt lets you register Talaria at `https://api.newtalaria.com/mcp`.

## Why use this

The [Talaria plugin](https://github.com/newtalaria/talaria-agent-plugin) brings the same MCP plus five closed-loop skills. OAuth is preferred for Grok Bot.

## Before you start

Grok Bot prompts you to approve, complete OAuth in the browser, and choose your organisation. Install scopes are `mcp:read mcp:write mcp:keys`. A personal token from **Workspace › Integrations** is the fallback when OAuth stalls.

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Steps

### 1. Add with custom MCP

1. In Grok Bot chat, say: **Add a custom MCP server named Talaria at https://api.newtalaria.com/mcp**
2. Grok Bot prompts you to approve → complete OAuth in the browser → choose your organisation.
3. Try: *"What are the top open errors in production?"* or *"Get started with Talaria"*

### 2. Cursor plugin for skills

The **[Talaria plugin](https://github.com/newtalaria/talaria-agent-plugin)** brings the same MCP plus five closed-loop skills:

| Skill | When to use |
| ----- | ----------- |
| `talaria-get-started` | Connect, confirm org/project, first smoke read |
| `talaria-instrument` | SDK install, create project/key, send first test event |
| `talaria-observe-performance` | Health, traces, spans, queries, sessions, monitors |
| `talaria-triage-issue` | Investigate one issue (pack → trace/replay/suspects → optional GitHub) |
| `talaria-verify-fix` | After release: `verify_fix` verdict, optional status update |

Install the plugin or load it from the [GitHub repo](https://github.com/newtalaria/talaria-agent-plugin). Skills guide agents through the complete workflow: get-started → instrument → observe → triage → verify-fix.

**Listing:** [cursor.directory/plugins/talaria](https://cursor.directory/plugins/talaria)

## Check it worked

Confirm with `get_connection` to see your identity, org, and scopes (`mcp:read mcp:write mcp:keys`). Call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow:

- [Add Talaria with an agent](../add-talaria.md) (install playbook)
- [Triage issues with an agent](../triage-issues.md) (investigation playbook)
- [Agent skills overview](../README.md) (skills → playbooks map)

## Troubleshooting

### Personal token (if OAuth stalls)

**Cause:** OAuth stalls.

**Fix:**

1. Dashboard **Workspace › Integrations → Create personal MCP token**. Choose 30 days, 90 days, or until you revoke it.
2. Add the server manually with the custom MCP prompt and include the Bearer token in your authentication setup. Custom header configuration is client-dependent; OAuth is preferred for Grok Bot.

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT.

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

## Next steps

- [MCP overview](README.md)
- [Cursor plugin + skills](cursor.md)
- [Agent skills overview](../README.md)
