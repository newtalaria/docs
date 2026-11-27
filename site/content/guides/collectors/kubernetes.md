---
title: Kubernetes
description: Run the OpenTelemetry Collector on Kubernetes and export OTLP/HTTP to Talaria.
section: guides
order: 40
---

Use the Talaria CLI to generate official Helm, Operator, or Compose artifacts. Do not hand-write an exporter that uses gRPC.

## Before you start

- A Talaria project and a **secret** key with the write scopes you need (`logs:write` for logs)
- Store the key in a Kubernetes Secret and set `TALARIA_API_KEY` on the collector. Never commit it
- The CLI, installed from [get.newtalaria.com/cli](https://get.newtalaria.com/cli)

## Generate and apply

```bash
talaria plan          # unified diff of Collector, Helm, Compose, or systemd artifacts; writes nothing
talaria collector     # generate and apply the Collector config
```

The CLI also has `helm` and Operator apply commands. Generated manifests set:

- `OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf`
- `OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest-nz1.newtalaria.com/otlp` (or your configured ingest URL)
- The key only in `OTEL_EXPORTER_OTLP_HEADERS` / `TALARIA_API_KEY`
- HTTP/2 ping defaults (`http2_read_idle_timeout: 10s`, `http2_ping_timeout: 5s`)

On Kubernetes with the Operator, annotate a workload to inject the language agent, for example:

```yaml
instrumentation.opentelemetry.io/inject-nodejs: "true"
```

The key is still only `OTEL_EXPORTER_OTLP_HEADERS`. See [OTLP/HTTP](/guides/collectors/otlp/) for the exporter contract.

## Check the result

`talaria status` shows heartbeat and last ingest. Look for logs or spans in the dashboard, filtered by `service.name`.
