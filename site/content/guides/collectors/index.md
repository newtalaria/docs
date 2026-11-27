---
title: Collectors
description: Send logs, traces, and metrics to Talaria with the OpenTelemetry Collector or an OTLP exporter.
section: guides
order: 20
---

A collector sits next to your app, tails logs or scrapes metrics, and exports **OTLP/HTTP** to Talaria. Official SDKs can send errors and traces on their own; use a collector when you want file logs, host metrics, or a vendor-neutral pipeline.

## Pick a guide

| Situation | Guide |
| --- | --- |
| You already have an OTel SDK or collector | [OTLP/HTTP](/guides/collectors/otlp/) |
| Kubernetes | [Kubernetes](/guides/collectors/kubernetes/) |
| SiteHost PHP containers | [SiteHost containers](/guides/collectors/sitehost/) |
| Python, FastAPI, Java, Go, or .NET without a Talaria SDK | The [OpenTelemetry quickstarts](/guides/) |

## Rules that apply everywhere

- Export **HTTP only** (`http/protobuf` recommended, `http/json` accepted). There is no gRPC ingest.
- Hosted ingest is `https://ingest-<cell>.newtalaria.com/otlp`. The nz1 example is `https://ingest-nz1.newtalaria.com/otlp`.
- Authenticate with `Authorization: Bearer` and a project key. **Logs** require a secret key with `logs:write`.
- Uncompressed bodies larger than **6 MiB** receive `413`.
- The CLI pins **otelcol-contrib 0.164.0** and writes HTTP/2 ping settings so idle connections through a proxy are redialled (`http2_read_idle_timeout: 10s`, `http2_ping_timeout: 5s`, `keepalive.idle_conn_timeout: 60s`).

Generate a config with `talaria collector` (see the [CLI](/cli/)) instead of downloading a loose `otelcol.yaml`.
