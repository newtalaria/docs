```bash
# Required: OTLP endpoint and authentication
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.newtalaria.com/otlp"
export OTEL_EXPORTER_OTLP_HEADERS="x-api-key=tal_prod_YOUR_KEY_HERE"

# Required: Service identification
export OTEL_SERVICE_NAME="your-service-name"

# Required: Release and environment (via resource attributes)
export OTEL_RESOURCE_ATTRIBUTES="service.version=${TALARIA_RELEASE},deployment.environment.name=production,vcs.ref.head.revision=${TALARIA_COMMIT_SHA}"

# Recommended: Protocol (defaults to http/protobuf)
export OTEL_EXPORTER_OTLP_PROTOCOL="http/protobuf"

# Optional: Enable compression
export OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
```

**Notes:**
- The endpoint is a base URL that SDKs automatically extend with `/v1/traces`, `/v1/logs`, and `/v1/metrics` per the OTLP spec.
- gRPC is **not** supported (Cloudflare returns 403). Use only `http/protobuf` or `http/json`.
- For per-signal endpoints, set `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`, `OTEL_EXPORTER_OTLP_LOGS_ENDPOINT`, and `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` with the full path including `/otlp/v1/{signal}`.
- Use environment-specific key prefixes: `tal_prod_`, `tal_stg_`, `tal_test_`, `tal_dev_`.
