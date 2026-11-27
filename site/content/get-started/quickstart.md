---
title: Quickstart
description: Send a first event into Talaria with an official SDK, the CLI, or an agent.
section: get-started
order: 20
---

Pick one path. Each ends with an event (or a log, or a span) in the [dashboard](https://one.newtalaria.com).

## 1. Official SDK

Install the package for your stack from the [SDK hub](/sdk/), initialise with a project key, and trigger an error or a log.

- Browser, React, Next.js, and Node.js use the `@newtalaria/*` packages (current release **0.6.1**).
- Dart is `talaria` **0.4.1**. Flutter is `talaria_flutter` **0.3.1** (publishable key only). Serverpod is `talaria_serverpod` **0.3.3**.
- PHP is `talaria/talaria` **3.0.3**. Laravel and Silverstripe are the `talaria/laravel` and `talaria/silverstripe` adapters at the same version.

The API key decides the environment and, on Talaria Cloud, the ingest host. Leave `url` / `TALARIA_URL` unset unless you are self-hosting or the key's cell is `self`.

## 2. CLI

Install the CLI from [get.newtalaria.com/cli](https://get.newtalaria.com/cli), then run `talaria init` in your app. Official OpenTelemetry stacks (Python, FastAPI, Java, Go, .NET, or an existing OTel exporter) get the `OTEL_*` block described in the [collector guides](/guides/collectors/).

```bash
curl -fsSL https://get.newtalaria.com/cli | sh
talaria init
```

`talaria verify` probes ingest, or starts the app and waits for the first event.

## 3. Agent

Point Cursor, Claude Code, VS Code, or another Streamable HTTP client at the hosted MCP, or run `talaria mcp serve` over stdio. See [MCP and agents](/agents/).

## What you should see

Open the project in the dashboard. A test error from `captureException` appears as an issue. A collector log or an OTLP span appears under logs or performance once those signals are enabled in [project settings](/get-started/project-settings/).
