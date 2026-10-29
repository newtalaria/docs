---
id: otlp-endpoint
title: OTLP Endpoint
path: reference/otlp.md
---

# OTLP Endpoint

Talaria accepts OpenTelemetry Protocol (OTLP) data over **HTTP only** (protobuf or JSON). gRPC is not supported.

## Endpoint

```
https://ingest.newtalaria.com/otlp
```

This is a **base URL**. The OTLP specification requires clients to append the signal-specific path:

- **Traces:** `POST /otlp/v1/traces`
- **Logs:** `POST /otlp/v1/logs`
- **Metrics:** `POST /otlp/v1/metrics`

Most OpenTelemetry SDKs and Collectors perform this automatically when you set `OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.newtalaria.com/otlp`.

## Authentication

Include your API key in the `x-api-key` header or as a Bearer token:

```bash
# Recommended
x-api-key: tal_prod_YOUR_KEY_HERE

# Also accepted
Authorization: Bearer tal_prod_YOUR_KEY_HERE
```

Use environment-specific key prefixes:
- `tal_prod_` for production
- `tal_stg_` for staging
- `tal_test_` for test
- `tal_dev_` for development

## Protocol

| Protocol | Support | Notes |
|---|---|---|
| `http/protobuf` | ✅ Supported (recommended) | Default per OTLP spec |
| `http/json` | ✅ Supported | Alternative encoding |
| `grpc` | ❌ Not supported | Cloudflare returns 403 |

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

See the [OTLP environment snippet](#) for the complete configuration.

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.newtalaria.com/otlp"
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=tal_prod_YOUR_KEY_HERE"
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"
export OTEL_SERVICE_NAME="your-service-name"
```

## Per-Signal Endpoints

To send different signals to different destinations, use per-signal endpoint variables with the **full path**:

```bash
# Override traces only (logs and metrics use the base endpoint)
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT="https://ingest.newtalaria.com/otlp/v1/traces"
```

## Error Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 403 | Forbidden (invalid or missing API key, or gRPC attempted) |
| 413 | Payload too large (> 6 MiB uncompressed) |
| 500 | Server error (retry with exponential backoff) |

## Example: OpenTelemetry Collector

```yaml
exporters:
  otlp_http:
    endpoint: https://ingest.newtalaria.com/otlp
    headers:
      x-api-key: ${env:TALARIA_API_KEY}
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

- [Resource Attributes](#) (Semantic Conventions v1.44.0)
- [Kubernetes Integration](#)
- [OpenTelemetry SDKs](#)
