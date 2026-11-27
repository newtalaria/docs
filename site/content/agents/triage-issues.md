---
title: Triage issues
description: Investigate a grouped error with MCP tools, then verify a fix.
section: agents
order: 30
---

1. `list_projects` (or skip it on a project-scoped URL).
2. `search_issues`, then `get_issue`. Prefer `get_investigation` or the `talaria-fix-issue` prompt when you have an issue id (`talaria://issue/{id}`).
3. Follow `traceId` or `sessionId` when present (`search_traces`, `get_trace`, `get_replay`).
4. Include `dashboardUrl` from tool results when you cite an issue.
5. After a change, `verify_fix` and `update_issue_status` (needs `mcp:operate` and a note when resolving or ignoring).

`get_issue` / `get_investigation` return an investigation pack (latest event, stack, breadcrumbs, optional logs and metrics). They do not return recording bytes or secrets.

Prompts: `talaria-fix-issue` (`issueId`), `talaria-verify-release` (`release?`), `talaria-investigate-performance` (`traceId?`, `route?`). Follow the skills `talaria-triage-issue` then `talaria-verify-fix`.
