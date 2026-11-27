---
title: .NET
description: Send OpenTelemetry data from .NET to Talaria over OTLP/HTTP.
section: guides
order: 100
---

Talaria does not ship a .NET SDK. Use the upstream OpenTelemetry .NET exporter or auto-instrumentation, over OTLP/HTTP.

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

Manual instrumentation:

```bash
dotnet add package OpenTelemetry.Extensions.Hosting
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
```

Auto-instrumentation sets `OTEL_DOTNET_AUTO_*` from the [upstream install script](https://opentelemetry.io/docs/zero-code/dotnet/). `talaria init --stack dotnet` writes the Talaria `OTEL_*` environment only. It does not pin a package version and does not run the install script.


The CLI writes this environment (`talaria init --stack` uses the ids `python`, `fastapi`, `java`, `go`, and `dotnet`) but does not install language agents except where the hint below says so. See [OTLP/HTTP](/guides/collectors/otlp/) for limits and status codes.
