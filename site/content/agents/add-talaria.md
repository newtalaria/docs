---
title: Add Talaria with an agent
description: Let an MCP client install an official SDK or an OpenTelemetry exporter into a repo.
section: agents
order: 20
---

Use this runbook after the client is connected (see [MCP](/agents/mcp/)). The grant must not be read-only if the agent will create a project or mint a key.

1. `get_doc` on `agents/add-talaria` (this page) or `search_docs`.
2. Detect the stack. `get_setup_plan` returns the official recipe once the stack is known.
3. `get_connection` and announce the user and organisation. Ask before creating a project or a key.
4. On yes, call `setup_project` with `confirmed: true` on a URL **without** `?readonly=true`. It creates or reuses a project and can return a development key.
5. Wire the official SDK from the [SDK hub](/sdk/) for that stack, or the [OpenTelemetry quickstarts](/guides/) if there is no official SDK. The key decides the environment. Do not pass `environment` in init.
6. `send_test_event`, then verify with `search_events` / `search_issues`.

`create_api_key` mints a publishable key into the tool result, or returns a reveal URL for a secret, collector, or release key and never the value itself.

You can also install from the terminal: `talaria init` and `talaria mcp agent`. See the [CLI](/cli/).
