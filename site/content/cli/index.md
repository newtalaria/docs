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

## Everyday commands

| Command | What it does |
| --- | --- |
| `talaria init` | Detect the stack and apply the official recipe |
| `talaria plan` | Print a unified diff of official Collector, Helm, Compose, or systemd artifacts (writes nothing) |
| `talaria collector` | Generate and apply the OpenTelemetry Collector config |
| `talaria verify` | Probe ingest, or start the app and wait for the first event |
| `talaria status` | Show heartbeat and last ingest |
| `talaria sourcemaps upload` | Upload JavaScript source maps and Dart or Flutter debug symbols |
| `talaria releases` | Record a release, its commits, and a deploy |
| `talaria validate` | Validate `talaria.yaml` against the published JSON Schema |
| `talaria upgrade` | Print how to move the Collector pin |
| `talaria uninstall` | Stop the local Collector (does not delete server projects or keys) |
| `talaria mcp` | Install, call, or serve the Talaria MCP |
| `talaria mcp serve` | Serve MCP over stdio using the CLI login |
| `talaria mcp call <tool>` | Call one MCP tool with the CLI login |

Generated collector exporters use OTLP/HTTP (`proto`, gzip, `Authorization: Bearer ${env:TALARIA_API_KEY}`) and HTTP/2 ping defaults (`http2_read_idle_timeout: 10s`, `http2_ping_timeout: 5s`, `keepalive.idle_conn_timeout: 60s`). See [Collectors](/guides/collectors/) and [MCP](/agents/).
