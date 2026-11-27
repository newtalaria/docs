---
title: MCP
description: "Hosted Talaria MCP: URL, auth, scoped paths, clients, and the tool catalogue."
section: agents
order: 40
---

MCP uses **OAuth** or a **personal token** from **Settings → Integrations**. API keys (`tal_pk_…` or `tal_sk_…`) never work on `/mcp`. A personal token lasts 30 days, 90 days, or until you revoke it. Treat it as a secret. Install scopes are `mcp:read mcp:setup mcp:operate`; `mcp:keys` is off by default (add it only when the agent must handle secret or collector keys).

Hosted URL: `https://api.newtalaria.com/mcp`. Transport is Streamable HTTP. The default protocol is `2026-07-28`. The dashboard and these snippets use the read-only project-scoped URL:

```
https://api.newtalaria.com/mcp/{org}/{project}?readonly=true
```

`{org}` and `{project}` are the UUIDs shown in **Settings → Integrations**. Drop `?readonly=true` if the agent must install the SDK (`setup_project`, `create_api_key`, `send_test_event`) or change issues. See [scoped URLs](/agents/mcp/#scoped-urls).

## Scoped URLs

| URL | What the agent can reach |
| --- | --- |
| `/mcp/{org}/{project}?readonly=true` | One project, read tools only. Default in the dashboard and these docs. |
| `/mcp/{org}/{project}` | One project, read and write tools (still limited by token scope). |
| `/mcp` | Every project you can access in the organisation. |

`?readonly=true` hides write tools from `tools/list` and refuses them on `tools/call`. `?toolsets=` can limit groups (`issues`, `events`, and others); `docs` and `connection` stay on. A token bound to one project is refused on `/mcp` and on any other project's URL.

## Clients without OAuth

```json
{ "command": "talaria", "args": ["mcp", "serve"] }
```

`talaria mcp call <tool> --args '{…}'` calls one tool with the CLI login. `talaria docs search` and `talaria docs get` read the same pages as `search_docs` and `get_doc`.

## Tool catalogue

There are **47** tools in the generated catalogue (`new_talaria` `docs/mcp-tools.json`). `search_docs` and `get_doc` can be called by name without org auth. After connect, call `get_connection` first.

Docs and connection: `search_docs`, `get_doc`, `get_connection`, `switch_organization`.

Setup: `list_projects`, `get_project`, `update_project_settings`, `create_api_key`, `setup_project`, `send_test_event`, `get_setup_plan`, `get_setup`, `report_setup_progress`.

Issues and events: `search_issues`, `get_issue`, `get_investigation`, `update_issue_status`, `add_issue_comment`, `create_github_issue`, `link_github_issue`, `list_issue_links`, `unlink_github_issue`, `verify_fix`, `list_suspect_commits`, `search_events`, `wait_for_event`, `get_event`, `get_replay`, `get_source_context`.

Releases, traces, logs, metrics, flags, monitors: `list_releases`, `get_release`, `search_traces`, `get_trace`, `list_suspect_spans`, `list_database_queries`, `run_report`, `save_report`, `list_feature_flags`, `get_feature_flag`, `set_feature_flag_off`, `set_feature_flag_percent`, `list_monitors`, `list_monitor_runs`, `search_logs`, `get_log`, `search_metrics`, `list_agent_runs`.

Resources include `talaria://docs/{path}`, `talaria://setup/recipes/{stack}`, `talaria://project/{id}/setup`, and `talaria://issue/{issueId}`.

Protocol versions advertised: `2026-07-28`, `2025-11-25`, `2025-06-18`, `2025-03-26`.
