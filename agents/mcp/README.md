---
title: Talaria MCP server
description: >-
  Hosted Talaria MCP server: docs tools, investigation, integration scopes, and
  authentication.
tags:
  - mcp
  - agents
id: mcp
navTitle: MCP server
type: hub
section: agents
platform: []
feature: []
order: 50
lastReviewed: '2026-10-29'
owner: docs
---

# MCP

Hosted MCP at `https://api.newtalaria.com/mcp`. Transport is Streamable HTTP. Auth is OAuth (the client discovers `/.well-known/oauth-protected-resource`, registers at `/oauth/register`, and you approve consent) or a personal token from **Workspace › Integrations**. Install scopes are `mcp:read mcp:write mcp:keys`. A personal token lasts 30 days, 90 days, or until you revoke it. It is opaque base64url JSON (one segment, not a three-part JWT).

<!-- snippet: api-key-warning -->
> [!WARNING]
> MCP uses OAuth or a personal token. API keys, publishable (`tal_pk_…`) or secret (`tal_sk_…`), never work on `/mcp`.
<!-- /snippet -->
Never send a monitor token to MCP.

`tools/list` requires a grant. `get_doc, list_docs, and search_docs` tools/call still work without auth when called by name. After connect, call `get_connection` before mutating.

The dashboard button **Copy Cursor mcp.json** is the Cursor file. Other clients use a different key for the same URL. Pasting the Cursor file into Claude Code fails, because an entry with `url` and no `type` is skipped.

## Clients

| Client | Config key | Page |
| ------ | ---------- | ---- |
| Cursor | `mcpServers` → `url` | [Cursor](cursor.md) |
| Grok Bot | Custom Add MCP chat prompt or marketplace handle `talaria` | [Grok Bot](grok-bot.md) |
| VS Code | `servers` → `type: http` + `url` | [VS Code](vscode.md) |
| Copilot CLI | `copilot plugin install` | No guide yet |
| Claude Code | `mcpServers` → `type: http` + `url` | [Claude Code](claude-code.md) |
| Gemini CLI | `mcpServers` → `httpUrl` | [Gemini CLI](gemini-cli.md) |
| Codex | `[mcp_servers.Talaria]` → `url` | [Codex](codex.md) |
| Windsurf | `mcpServers` → `serverUrl` | [Windsurf](windsurf.md) |

## Agent skills

The **Talaria** plugin for Cursor and Grok Bot includes five closed-loop skills that guide agents from install through fix verification:

| Skill | When to use |
| ----- | ----------- |
| `talaria-get-started` | Connect, confirm org/project, first smoke read (`get_doc, list_docs, and search_docs` or `search_issues`) |
| `talaria-instrument` | SDK install, create project/key (`setup_project`), send first test event |
| `talaria-observe-performance` | Health (`get_project_stats`), traces, spans, queries, sessions, monitors, logs (`search_logs`) |
| `talaria-triage-issue` | Investigate one issue (pack → trace/replay/suspects → optional GitHub issue) |
| `talaria-verify-fix` | After release: `verify_fix` verdict, optional `update_issue_status` |

**Closed loop:** get-started → instrument → observe → triage → verify-fix.

Skills are available from the **[Talaria plugin](https://github.com/newtalaria/talaria-agent-plugin)**.

Agents can also follow the Markdown playbooks via `get_doc`: [Add Talaria with an agent](../add-talaria.md) (≈ instrument), [Triage issues with an agent](../triage-issues.md) (≈ triage). See [Agent skills overview](../README.md) for the skills → playbooks map.

## Tool catalogue

### Public by name (no org auth on `tools/call`)

| Tool | Purpose |
| ---- | ------- |
| `list_docs` | Manifest entries; filter by `sdk` / `prefix` |
| `search_docs` | Ranked search over title, path, tags, headings, body |
| `get_doc` | Full Markdown for a path/id |

For install tasks, start with `get_doc` on `agents/add-talaria`.

### Authenticated (`mcp:read` and above)

| Tool | Purpose |
| ---- | ------- |
| `get_connection` | Announce signed-in user, org, and capabilities |
| `switch_organization` | Move the grant to another org you belong to |
| `list_projects` | List org projects |
| `get_project` | Safe project settings (tracing/analytics/replay/heatmaps/sample rates) — no webhook secrets |
| `search_issues` / `get_issue` | Grouped issues and detail, including comments on `get_issue`. `get_issue` also returns `investigation`: issue, latest event, trace summary, replay summary, source slice, and breadcrumbs. `search_issues` takes `environment` |
| `get_replay` | Replay summary (url, duration, status, dashboard URL) for `projectId` and `replayId`. No recording bytes |
| `get_source_context` | Commit-exact GitHub source for one stack frame (`projectId`, `eventId`, `frameIndex`) |
| `search_events` / `get_event` | Event instances. `search_events` takes `projectId`, and optional `environment`, `issueId`, `query`, `userId`, `sessionId`, `release`, `traceId`, `from`, `to`, and `limit`. `get_event` takes `eventId` and returns that instance: stack, breadcrumbs, release, user, session, and a dashboard URL |
| `get_source_map` | Original source window for one stored frame (`eventId`, `frameIndex`). `mapped: false` includes the `fileName` still to upload |
| `search_traces` / `get_trace` | Transactions / waterfalls. `search_traces` takes `projectId` and optional `environment`, `errorsOnly`, `grouped`, `sort` (only when grouped), `route`, `from`, `to`, and `limit`. Grouped rows include count, error count, p50, and p95. `get_trace` takes `projectId` and `traceId` |
| `list_suspect_spans` | Child spans with the highest p95 in the window. Takes `environment` |
| `list_database_queries` | Database statements grouped by text: calls, total time, p95, errors, and N+1 trace count. `nPlusOneOnly` keeps N+1 statements. Takes `environment` |
| `search_sessions` | Product sessions. Takes `projectId`, and optional `userId`, `sessionId`, `from`, `to`, `environment`, and `limit` |
| `get_project_stats` | Health snapshot for one environment, plus per-environment counts. Takes `environment` |
| `list_issue_links` | Linked GitHub issues for one `issueId` |
| `verify_fix` | Whether a fix held after release. Required `issueId`. Optional `release` or `sha` |
| `list_suspect_commits` | Suspect commits for one issue. Required `issueId`. Optional `eventId` |
| `list_releases` / `get_release` | Project releases. `list_releases` takes `projectId`, and optional `environment` and `limit`. `get_release` takes `projectId`, `version`, and optional `environment` |
| `wait_for_event` | Wait for a matching event. Required `projectId` and `since` (ISO-8601). Optional `issueId`, `release`, `environment`, `query`, `userId`, `sessionId`, and `timeoutSeconds` (default 15, clamped to 1–30) |
| `list_feature_flags` / `get_feature_flag` | List flags, or one flag. `get_feature_flag` takes `flagId`, or `projectId` plus `key`. One flag definition per project; evaluation uses the API key's environment |
| `list_monitors` / `list_monitor_runs` | `list_monitors` takes `projectId`. `list_monitor_runs` takes `monitorId` and optional `limit` (default 30, clamped to 1–50) |
| `search_logs` | Recent log lines for `projectId`. Optional `traceId`, `serviceName`, `minSeverity`, and `limit` |
| `list_agent_runs` | Recent agent runs for the organization. Optional `limit` (default 20, clamped to 1–50) |

### Elevated scopes

| Tool | Scope | Purpose |
| ---- | ----- | ------- |
| `update_project_settings` / `create_project` / `send_test_event` | `mcp:write` | Safe settings, create project, ingest a test event |
| `update_issue_status` / `add_issue_comment` | `mcp:write` | Resolve, ignore, or reopen one issue (a note is required to resolve or ignore, and is stored as a comment), or add a comment without changing status |
| `create_github_issue` / `link_github_issue` / `unlink_github_issue` | `mcp:write` | Create, link, or unlink one GitHub issue. `create_github_issue` takes `issueId` and optional `dry_run`. `link_github_issue` takes `issueId` and `reference` (URL, `owner/repo#123`, or `#123`) |
| `set_feature_flag_off` / `set_feature_flag_percent` | `mcp:write` | Turn a flag off, or set `percent` (0–100). Both take `flagId`, or `projectId` plus `key` |
| `create_api_key` / `setup_project` | `mcp:keys` | Mint a key once; never log or commit. Omit `scopes` for the publishable key (every publishable scope). `scopes: ["releases:write"]` is a release key for source-map upload. `setup_project` stays on the publishable key |

## Integration workflow

See [Add Talaria with an agent](../add-talaria.md), [Triage issues with an agent](../triage-issues.md), and the client pages above.

## Environment on read tools

`search_issues`, `search_events`, `search_traces`, `list_suspect_spans`, `list_database_queries`, `search_sessions`, `get_project_stats`, `list_releases`, `get_release`, and `wait_for_event` take `environment`: `development`, `test`, `staging`, or `production`. The default is production when the project has a production key, otherwise development. An agent that just installed should query development. `get_project_stats` `countsByEnvironment` is analytics volume for each environment and stays 0 when analytics is off. Install success is `search_issues` or `search_events`.

`setup_project` mints a development key. Production shipping is a second key.

## Investigation workflow

1. `list_projects` → real `projectId`
2. `search_issues` (pass `environment`; use `development` right after install, `production` for a live failure) → `get_issue`
3. A JavaScript frame that is still a hashed `*.js` file needs a source map for that release. Follow [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md), then `get_event` or `get_source_map`.
4. Optional `get_trace` / `search_sessions` in the same environment
5. Fix locally → verify with `search_events` (`issueId` set) / `search_issues` on `development`
6. When the issue has stopped firing, `update_issue_status` to `resolved` with a note. Noise is `ignored` with a note. A later event with the same fingerprint reopens a resolved issue. An ignored issue reopens when the project's reopen-ignored setting is on (the default). `resolved` and `ignored` can only return to `open`.
