---
title: Agents and MCP
description: >-
  Connect coding agents to Talaria: skills are the playbook, MCP is the tool
  belt. Get started, instrument, observe, triage, verify.
tags:
  - agents
  - skills
  - mcp
  - playbook
id: agents
navTitle: Overview
type: hub
section: agents
platform: []
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# Agent skills overview

The **Talaria** plugin for Cursor and Grok Bot includes five closed-loop skills that guide agents from initial connection through fix verification. These skills wrap the [hosted MCP](mcp/README.md) tools and reference the detailed playbooks in this docs repo.

**Plugin:** [github.com/newtalaria/talaria-agent-plugin](https://github.com/newtalaria/talaria-agent-plugin)  
**Listing:** [cursor.directory/plugins/talaria](https://cursor.directory/plugins/talaria)

---

## Closed-loop workflow

```
talaria-get-started → talaria-instrument → talaria-observe-performance → talaria-triage-issue → talaria-verify-fix
```

Each skill focuses on one phase, hands off to the next when appropriate, and constrains writes to prevent silent project creation or status changes.

---

## Skills → playbooks map

| Skill | Purpose | Core tools | Existing playbook |
| ----- | ------- | ---------- | ----------------- |
| `talaria-get-started` | Connect MCP, confirm org/project, first smoke read | `get_connection`, `list_projects`, `get_doc, list_docs, and search_docs`, `search_issues` | *Orientation only — no dedicated playbook* |
| `talaria-instrument` | SDK install, create project/key, send test event | `setup_project`, `send_test_event`, `search_events`, `get_doc` | [Add Talaria with an agent](add-talaria.md) |
| `talaria-observe-performance` | Health, traces, spans, queries, sessions, monitors | `get_project_stats`, `search_traces`, `list_suspect_spans`, `list_database_queries` | *Read-only stats — extends playbook tools* |
| `talaria-triage-issue` | Investigate one issue: pack → trace/replay → optional GitHub | `get_issue`, `get_trace`, `get_replay`, `list_suspect_commits`, `create_github_issue`, `update_issue_status` | [Triage issues with an agent](triage-issues.md) |
| `talaria-verify-fix` | After release: verdict + optional status update | `verify_fix`, `list_releases`, `get_release`, `wait_for_event`, `update_issue_status` | *Extends triage with release verification — see `verify_fix` tool in [MCP](mcp/README.md)* |

---

## Where agents get these skills

### From the Talaria plugin

Install the **[Talaria plugin](https://github.com/newtalaria/cursor-plugin)**. The plugin includes:

- `mcp.json` pointing at `https://api.newtalaria.com/mcp`
- Five skill `SKILL.md` files in `skills/` with YAML frontmatter

Agents that load the plugin automatically discover and apply these skills when relevant.

### From Markdown playbooks via `get_doc`

Agents that do **not** have the plugin installed can still follow the same workflows by reading the playbooks via MCP `get_doc`:

- **Install:** `get_doc` path `agents/add-talaria`
- **Triage:** `get_doc` path `agents/triage-issues`
- **Configuration:** `get_doc` path `get-started/configuration`
- **SDK reference:** `get_doc` path `sdk/<id>/README` (e.g. `sdk/flutter/README`)

The playbooks are the **detailed how-to**; the skills are **workflow guardrails** that enforce read-only smoke, ask before create, and hand off appropriately.

---

## Tool scopes

| Scope | Includes |
| ----- | -------- |
| `mcp:read` | `get_connection`, `list_projects`, `get_project`, `search_issues`, `get_issue`, `search_events`, `get_event`, `search_traces`, `get_trace`, `get_replay`, `list_suspect_commits`, `get_source_context`, `get_source_map`, `list_suspect_spans`, `list_database_queries`, `search_sessions`, `get_project_stats`, feature flag reads, `list_releases`, `get_release`, `wait_for_event`, `verify_fix` |
| `mcp:write` | All read tools plus `update_project_settings`, `create_project`, `send_test_event`, `update_issue_status`, `add_issue_comment`, `create_github_issue`, `link_github_issue`, `unlink_github_issue`, feature flag writes |
| `mcp:keys` | All write tools plus `create_api_key`, `setup_project` |

Install scopes are `mcp:read mcp:write mcp:keys`. Skills ask before using write tools.

---

## Skill usage examples

### First-time setup

**User:** "Add Talaria to this Flutter project"

1. `talaria-get-started` → authenticate, confirm org
2. `talaria-instrument` → detect Flutter, `get_doc` SDK hub, `setup_project` with `confirmed: true`, wire `talaria_flutter`, `send_test_event`, `search_events` with `environment: development`
3. Hand off to `talaria-observe-performance` or `talaria-triage-issue` when ready

### Production investigation

**User:** "What's failing in production?" or paste a Talaria issue URL

1. `talaria-get-started` → confirm connection (may skip if already connected)
2. `talaria-triage-issue` → `get_issue` with `issueId`, read pack (latest instance, breadcrumbs, release, suspects), optional `get_trace` / `get_replay`, state hypothesis, optional GitHub create/link

### Post-release verification

**User:** "Did version 2.1.0 fix issue NORTH-4F2?"

1. `talaria-verify-fix` → `list_releases`, `get_release`, `verify_fix` with `issueId` + `release`, report verdict (`verified`, `regressed`, `pending_adoption`, etc.), optional `update_issue_status` to `resolved` after user approval

---

## Skills vs playbooks

| Source | Best for | Provides |
| ------ | -------- | -------- |
| **Skills** (plugin) | Agents with plugin support (Cursor, Grok Bot) | Workflow guardrails, read-only checks, ask-before-write, hand-offs |
| **Playbooks** (`get_doc`) | Any agent via MCP `get_doc, list_docs, and search_docs` tools | Detailed how-to, SDK snippets, conversation scripts, must-not rules |

Skills **reference** playbooks when needed (`get_doc` path `agents/add-talaria`). Playbooks are the canonical source of truth for SDK wiring; skills enforce the workflow.

---

## Related

- [MCP overview](mcp/README.md) — tool catalogue, scopes, auth
- [Add Talaria with an agent](add-talaria.md) — install playbook
- [Triage issues with an agent](triage-issues.md) — investigation playbook
- [Cursor MCP setup](mcp/cursor.md)
- [Grok Bot MCP setup](mcp/grok-bot.md)
- [Talaria plugin repo](https://github.com/newtalaria/talaria-agent-plugin)
