---
id: otlp-endpoint
title: OTLP endpoint
description: >-
  Send traces, logs, and metrics via OpenTelemetry Protocol (OTLP) over HTTP
  to ingest-nz1.newtalaria.com/otlp. HTTP/protobuf recommended, gRPC not supported.
tags:
  - otlp
  - opentelemetry
  - ingest
  - collector
navTitle: OTLP endpoint
type: reference
section: reference
platform: []
order: 10
feature: []
lastReviewed: '2026-10-29'
owner: docs
---

# OTLP endpoint

Talaria accepts OpenTelemetry Protocol (OTLP) data over **HTTP only** (protobuf or JSON). gRPC is not supported.

## Endpoint

```
https://ingest-nz1.newtalaria.com/otlp
```

This is a **base URL**. The OTLP specification requires clients to append the signal-specific path:

- **Traces:** `POST /otlp/v1/traces`
- **Logs:** `POST /otlp/v1/logs`
- **Metrics:** `POST /otlp/v1/metrics`

Most OpenTelemetry SDKs and Collectors perform this automatically when you set `OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest-nz1.newtalaria.com/otlp`.

## Authentication

Send `Authorization: Bearer` and a secret or publishable key. Collectors use a secret key (`tal_sk_<env>_nz1_…`) with the signal's write scope. A publishable key (`tal_pk_<env>_nz1_…`) is also accepted when it has that scope.

```bash
Authorization: Bearer tal_sk_prod_nz1_…
```

`<env>` is `prod`, `stg`, `test`, or `dev`.

## Protocol

| Protocol | Support | Notes |
|---|---|---|
| `http/protobuf` | ✅ Supported (recommended) | Default per OTLP spec |
| `http/json` | ✅ Supported | Alternative encoding |
| `grpc` | ❌ Not supported | OTLP export is HTTP only |

Set the protocol explicitly:

```bash
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
```

## Compression

gzip compression is supported and recommended for larger payloads:

```bash
export OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
```

Bodies over 6 MiB (before compression) will receive a 413 response.

## Environment Variables

See the [OpenTelemetry SDK Configuration](../sdk/README.md) for complete setup details.

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest-nz1.newtalaria.com/otlp"
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Bearer%20tal_sk_prod_nz1_…"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_SERVICE_NAME="your-service-name"
```

## Per-Signal Endpoints

To send different signals to different destinations, use per-signal endpoint variables with the **full path**:

```bash
# Override traces only (logs and metrics use the base endpoint)
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://ingest-nz1.newtalaria.com/otlp/v1/traces"
```

## Error Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 401 | `invalid_key` (missing or invalid API key) |
| 403 | `insufficient_scope` |
| 413 | Payload too large (> 6 MiB uncompressed) |
| 500 | Server error (retry with exponential backoff) |

## Example: OpenTelemetry Collector

```yaml
exporters:
  otlp_http:
    endpoint: https://ingest-nz1.newtalaria.com/otlp
    headers:
      Authorization: Bearer ${env:TALARIA_API_KEY}
    compression: gzip

service:
  pipelines:
    traces:
      exporters: [otlp_http]
    logs:
      exporters: [otlp_http]
    metrics:
      exporters: [otlp_http]
```

## Related

- [Kubernetes Integration](../deploy/hosts/kubernetes.md)
- [OpenTelemetry SDKs](../sdk/README.md)
