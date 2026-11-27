---
title: CLI
description: Install the Talaria CLI and generate collector configuration.
section: cli
order: 10
---

Install the CLI from the verified installer:

```bash
curl -fsSL https://get.newtalaria.com/cli | sh
```

The installer downloads a GitHub release archive when one exists, and otherwise falls back to `go install`. As of 27 November 2026 no published GitHub release was found for the CLI, so a default install follows the `go install` path from `dunatron/new_talaria`. HTTP/2 ping defaults from [new_talaria #511](https://github.com/dunatron/new_talaria/pull/511) (`http2_read_idle_timeout` 10s, `http2_ping_timeout` 5s, `keepalive.idle_conn_timeout` 60s on generated otlp_http exporters) are on `origin/main` as of `f68ee6197` (26 November 2026, Pacific/Auckland). A published CLI release that includes them has not been cut; publishing stays with Heath.

Use the CLI to generate `otelcol.yaml` (and Helm or Operator manifests) pointed at `https://ingest-<cell>.newtalaria.com/otlp` over HTTP. There is no gRPC ingest.
