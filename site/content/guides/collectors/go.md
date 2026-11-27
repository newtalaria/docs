---
title: Go
description: Send OpenTelemetry data from Go to Talaria over OTLP/HTTP.
section: guides
order: 90
---

Talaria does not ship a Go SDK. Go needs the OpenTelemetry SDK in application code. The Talaria recipe only writes environment variables.

## Environment

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

`talaria init --stack <id>` writes the same `OTEL_*` block. An empty environment in that command defaults to `production`.

## Next

Follow the [OpenTelemetry Go getting started guide](https://opentelemetry.io/docs/languages/go/getting-started/) and point the OTLP/HTTP exporter at the environment below.

`talaria init --stack go` writes the `OTEL_*` block and does not edit Go source.


The CLI writes this environment (`talaria init --stack` uses the ids `python`, `fastapi`, `java`, `go`, and `dotnet`) but does not install language agents except where the hint below says so. See [OTLP/HTTP](/guides/collectors/otlp/) for limits and status codes.
