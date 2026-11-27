---
title: CLI
description: Install the Talaria CLI, generate a collector config, and verify the first event.
section: cli
order: 10
---

The CLI installs OpenTelemetry into a Talaria project, generates collector config, and talks to MCP.

## Install

```bash
curl -fsSL https://get.newtalaria.com/cli | sh
talaria version
```

`talaria version` prints the CLI and the pinned Collector version. The CLI currently pins **otelcol-contrib 0.164.0**.

The full command tree is on [CLI commands](/cli/commands/).

## Everyday commands

| Command | What it does |
| --- | --- |
| `talaria init [path]` | Install the Talaria SDK for an official app stack |
| `talaria collector init` | Detect the stack and write a reviewable `talaria.yaml` |
| `talaria collector plan` | Print a unified diff of official Collector, Helm, Compose, or systemd artifacts (writes nothing) |
| `talaria collector apply` | Write the plan and apply it |
| `talaria collector validate` | Validate `talaria.yaml` against the published JSON Schema |
| `talaria verify` | Probe ingest, or start the app and wait for the first event |
| `talaria status` | Show heartbeat and last ingest |
| `talaria sourcemaps upload` | Upload JavaScript source maps and Dart or Flutter debug symbols |
| `talaria releases new` | Record a release, then `finalize` and `deploy` |
| `talaria collector upgrade` | Print how to move the Collector pin |
| `talaria collector uninstall` | Stop the local Collector (does not delete server projects or keys) |
| `talaria mcp install` | Write MCP client config, skills, and the AGENTS.md block |
| `talaria mcp serve` | Serve MCP over stdio using the CLI login |
| `talaria mcp call <tool>` | Call one MCP tool with the CLI login |

Generated collector exporters use OTLP/HTTP (`proto`, gzip, `Authorization: Bearer ${env:TALARIA_API_KEY}`) and HTTP/2 ping defaults (`http2_read_idle_timeout: 10s`, `http2_ping_timeout: 5s`, `keepalive.idle_conn_timeout: 60s`). See [Collectors](/guides/collectors/) and [MCP](/agents/).
