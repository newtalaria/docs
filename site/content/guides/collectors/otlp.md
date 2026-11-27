---
title: OTLP/HTTP
description: Point an OpenTelemetry SDK or Collector at Talaria over OTLP/HTTP. gRPC is not supported.
section: guides
order: 30
---

Talaria accepts OpenTelemetry Protocol (OTLP) data over **HTTP only** (protobuf or JSON). gRPC is not supported.

## Endpoint

```
https://ingest-nz1.newtalaria.com/otlp
```

This is a **base URL**. Clients append the signal path:

- Traces: `POST /otlp/v1/traces`
- Logs: `POST /otlp/v1/logs`
- Metrics: `POST /otlp/v1/metrics`

Most OpenTelemetry SDKs and collectors do that when you set `OTEL_EXPORTER_OTLP_ENDPOINT` to the base URL.

## Already instrumented

Keep your existing SDK. Change only the endpoint, protocol, and headers. `talaria init --stack already_otel` writes the same environment and does not add a library.

```bash
export OTEL_SERVICE_NAME="your-service"
export OTEL_RESOURCE_ATTRIBUTES="deployment.environment=production"
export OTEL_TRACES_EXPORTER="otlp"
export OTEL_METRICS_EXPORTER="otlp"
export OTEL_LOGS_EXPORTER="otlp"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest-nz1.newtalaria.com/otlp"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer ${TALARIA_API_KEY}"
```

`TALARIA_API_KEY` must be a **secret** key (`tal_sk_<env>_<cell>_…`) when you send logs (`logs:write`). Leave the placeholder in the shell; do not commit a real key. Protocol is `http/protobuf` only for this recipe — Talaria does not accept gRPC. The endpoint is the OTLP **base** URL; the SDK or collector appends `/v1/traces`, `/v1/logs`, and `/v1/metrics`.

## Collector exporter

The CLI generates this shape (encoding `proto`, gzip, Bearer token from `TALARIA_API_KEY`, HTTP/2 pings):

```yaml
exporters:
  otlphttp:
    endpoint: https://ingest-nz1.newtalaria.com/otlp
    encoding: proto
    compression: gzip
    headers:
      Authorization: Bearer ${env:TALARIA_API_KEY}
    timeout: 15s
    http2_read_idle_timeout: 10s
    http2_ping_timeout: 5s
    keepalive:
      idle_conn_timeout: 60s
```

Never put a real key in the file. Self-host configs use `${env:TALARIA_URL}` and that value must end with `/otlp`.

## Limits and status codes

| Code | Meaning |
| --- | --- |
| 200 | Accepted |
| 401 | Missing or invalid key |
| 403 | Insufficient scope (for example a publishable key on `/otlp/v1/logs`) |
| 413 | Body larger than 6 MiB after decompression |
| 429 | Rate limited (`Retry-After`) |
| 5xx | Retry with backoff |

gzip is supported and recommended. A fuller reference lives at [OTLP reference](/reference/otlp/).
