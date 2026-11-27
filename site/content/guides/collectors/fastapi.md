---
title: FastAPI
description: Send OpenTelemetry data from FastAPI to Talaria over OTLP/HTTP.
section: guides
order: 70
---

Talaria does not ship a Python SDK. For FastAPI, install the upstream OpenTelemetry Python distro and run uvicorn under `opentelemetry-instrument`.

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


## Install and run

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
opentelemetry-instrument uvicorn main:app
```

`talaria init --stack fastapi` writes the environment and prints that uvicorn command. It does not pin a distro version for you.

## Verify

Start the app and send one request. Open **Performance** in the [dashboard](https://one.newtalaria.com) and filter by `service.name` = `your-service`. Logs show under **Logs** once they are on in [project settings](/get-started/project-settings/). Nothing there? Run `talaria verify`, then check the [status codes](/guides/collectors/otlp/#limits-and-status-codes).
