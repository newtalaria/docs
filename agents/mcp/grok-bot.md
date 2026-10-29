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
aliases:
  - mcp/grok-bot.md
redirectFrom:
  - /docs/mcp/grok-bot
---

# Grok Bot

## Add with custom MCP (available now)

Custom MCP chat prompt lets you register Talaria before the marketplace handle is approved:

1. In Grok Bot chat, say: **Add a custom MCP server named Talaria at https://api.newtalaria.com/mcp**
2. Grok Bot prompts you to approve → complete OAuth in the browser → choose your organisation.
3. Confirm with `get_connection` to see your identity, org, and scopes (`mcp:read mcp:write mcp:keys`).
4. Try: *"What are the top open errors in production?"* or *"Get started with Talaria"*

## Add from Connect apps (pending approval)

Once the Talaria marketplace handle `talaria` is approved:

1. Open **Connect apps** in Grok Bot.
2. Search **Talaria**.
3. Install → confirm → authorise in the browser → choose your organisation.

## Cursor plugin for skills

The **Talaria** plugin in Cursor Marketplace brings the same MCP plus five closed-loop skills:

| Skill | When to use |
| ----- | ----------- |
| `talaria-get-started` | Connect, confirm org/project, first smoke read |
| `talaria-instrument` | SDK install, create project/key, send first test event |
| `talaria-observe-performance` | Health, traces, spans, queries, sessions, monitors |
| `talaria-triage-issue` | Investigate one issue (pack → trace/replay/suspects → optional GitHub) |
| `talaria-verify-fix` | After release: `verify_fix` verdict, optional status update |

Install the plugin or load it from the [GitHub repo](https://github.com/newtalaria/talaria-agent-plugin). Skills guide agents through the complete workflow: get-started → instrument → observe → triage → verify-fix.

**Listing:** [cursor.directory/plugins/talaria](https://cursor.directory/plugins/talaria)

## Personal token (if OAuth stalls)

1. Dashboard **Settings → Integrations → Create personal MCP token**. Choose 30 days, 90 days, or until you revoke it.
2. Add the server manually with the custom MCP prompt and include the Bearer token in your authentication setup. Custom header configuration is client-dependent; OAuth is preferred for Grok Bot.

The token is an **opaque single-segment** base64url JSON payload (starts with `eyJzdWIi…`), not a three-part JWT. Never use an ingest key (`tal_live_…`).

## After connect

Call `get_connection` and announce identity before creating projects or minting keys. Install and investigation follow:

- [Add Talaria with an agent](../guides/add-talaria-with-an-agent.md) (install playbook)
- [Triage issues with an agent](../guides/triage-issues-with-an-agent.md) (investigation playbook)
- [Agent skills overview](../guides/agent-skills.md) (skills → playbooks map)

## Related

- [MCP overview](README.md)
- [Cursor plugin + skills](cursor.md)
- [Agent skills overview](../guides/agent-skills.md)
