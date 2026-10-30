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
lastReviewed: '2026-10-30'
owner: docs
---

# Talaria docs

Canonical integration knowledge for Talaria. Humans read this on [www.newtalaria.com/docs](https://www.newtalaria.com/docs). Coding agents read the same pages via MCP `list_docs`, `search_docs`, and `get_doc`.

Learn guides and product narrative stay on the marketing site (`/learn`, `/product`). This repo is install and how-to only.

## For agents

Start here: [Add Talaria with an agent](agents/add-talaria.md).

**Skills (closed loop):** Cursor and Grok Bot agents can use the Talaria plugin skills (get-started → instrument → observe-performance → triage-issue → verify-fix). See [Agent skills overview](agents/README.md) for the skills → playbooks map.

Then:

1. Detect the stack from the local repo (`pubspec.yaml`, `package.json`, `composer.json`).
2. `search_docs` with an `sdk` filter (for example `flutter`) and query `install` or `init`.
3. `get_doc` the stack hub and configuration page.
4. Wire the API key. Browser and mobile code takes a publishable `tal_pk_dev_<cell>_…` key (env or `--dart-define` is fine). Servers take a secret `tal_sk_dev_<cell>_…` key that never ships to a client. Leave `TALARIA_URL` unset: the SDK derives `https://ingest-<cell>.newtalaria.com` from the key. The key decides the environment. `setup_project` returns a development key. Do not pass `environment` in SDK init. Send `release` as `<ref>@<shortsha>` (for example `main@a8f31c2`). See [Releases](features/releases.md). Server SDKs fill that from CI when `TALARIA_RELEASE` is unset.
5. Tell the human which **Project settings** to enable (or use MCP `get_project` / `update_project_settings` when authorized).
6. Verify with `search_events` / `search_issues` and `environment: development`. `get_project_stats` `countsByEnvironment` is analytics volume and stays 0 when analytics is off.
