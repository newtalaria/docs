---
title: Talaria docs
description: Canonical Markdown docs for humans and coding agents — install, configure, and verify Talaria.
tags: [hub, agents]
---

# Talaria docs

Canonical integration knowledge for Talaria. Humans read this on [newtalaria.com/next-docs](https://newtalaria.com/next-docs). Coding agents read the same pages via MCP `docs_list`, `docs_search`, and `docs_get`.

## For agents

Start here: [Add Talaria with an agent](guides/add-talaria-with-an-agent.md).

Then:

1. Detect the stack from the local repo (`pubspec.yaml`, `package.json`, `composer.json`).
2. `docs_search` with an `sdk` filter (for example `flutter`) and query `install` or `init`.
3. `docs_get` the stack hub and configuration page.
4. Wire DSN + API key (`tal_live_…` keys are public client ingest credentials — env / dart-define are fine).
5. Tell the human which **Project settings** to enable (or use MCP `get_project` / `update_project_settings` when authorized).
6. Verify with `search_events` / `get_project_stats` / `search_errors`.

## Browse

| Section | Path |
| ------- | ---- |
| Quickstart | [getting-started/quickstart.md](getting-started/quickstart.md) |
| Project configuration | [getting-started/configuration.md](getting-started/configuration.md) |
| SDKs | [sdk/README.md](sdk/README.md) |
| Flutter | [sdk/flutter/README.md](sdk/flutter/README.md) |
| MCP | [mcp/README.md](mcp/README.md) |
| Agent playbook | [guides/add-talaria-with-an-agent.md](guides/add-talaria-with-an-agent.md) |
| Analytics setup | [analytics/setup.md](analytics/setup.md) |
| API overview | [api/overview.md](api/overview.md) |

Learn guides and product narrative stay on the marketing site (`/learn`, `/product`). This repo is install and how-to only.
