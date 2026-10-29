---
title: Talaria docs
description: >-
  Canonical Markdown docs for humans and coding agents: install SDKs, switch on
  features, or let your agent set it up.
tags:
  - hub
  - agents
id: docs
type: hub
section: get-started
platform: []
feature: []
order: 1
lastReviewed: '2026-10-29'
owner: docs
---

# Talaria docs

Canonical integration knowledge for Talaria. Humans read this on [www.newtalaria.com/docs](https://www.newtalaria.com/docs). Coding agents read the same pages via MCP `docs_list`, `docs_search`, and `docs_get`.

## For agents

Start here: [Add Talaria with an agent](agents/add-talaria.md).

**Skills (closed loop):** Cursor and Grok Bot agents can use the Talaria plugin skills (get-started → instrument → observe-performance → triage-issue → verify-fix). See [Agent skills overview](agents/README.md) for the skills → playbooks map.

Then:

1. Detect the stack from the local repo (`pubspec.yaml`, `package.json`, `composer.json`).
2. `docs_search` with an `sdk` filter (for example `flutter`) and query `install` or `init`.
3. `docs_get` the stack hub and configuration page.
4. Wire URL + API key (`tal_prod_…` keys are public client ingest credentials — env / dart-define are fine). The key decides the environment. `setup_project` returns a development key. Do not pass `environment` in SDK init. Send `release` as `<ref>@<shortsha>` (for example `main@a8f31c2`). See [Releases](features/../features/releases.md). Server SDKs fill that from CI when `TALARIA_RELEASE` is unset.
5. Tell the human which **Project settings** to enable (or use MCP `get_project` / `update_project_settings` when authorized).
6. Verify with `search_events` / `search_issues` and `environment: development`. `get_project_stats` `countsByEnvironment` is analytics volume and stays 0 when analytics is off.

## Browse

| Section | Path |
| ------- | ---- |
| Quickstart | [get-started/quickstart.md](get-started/quickstart.md) |
| Project configuration | [get-started/project-settings.md](get-started/project-settings.md) |
| SDKs | [sdk/README.md](sdk/README.md) |
| Flutter | [sdk/flutter/README.md](sdk/flutter/README.md) |
| MCP | [agents/mcp/README.md](agents/mcp/README.md) |
| Agent skills | [agents/README.md](agents/README.md) |
| Agent playbook | [agents/add-talaria.md](agents/add-talaria.md) |
| JavaScript source maps | [guides/upload-javascript-source-maps.md](guides/upload-javascript-source-maps.md) |
| Releases | [features/../features/releases.md](features/../features/releases.md) |
| Analytics setup | [features/analytics.md](features/analytics.md) |
| Cookie banners | [guides/cookie-banners.md](guides/cookie-banners.md) |
| API overview | [reference/ingest-api.md](reference/ingest-api.md) |

Learn guides and product narrative stay on the marketing site (`/learn`, `/product`). This repo is install and how-to only.
