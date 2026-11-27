---
title: Java
description: Send OpenTelemetry data from Java to Talaria over OTLP/HTTP.
section: guides
order: 80
---

Talaria does not ship a Java SDK. Use the upstream OpenTelemetry Java agent and export OTLP/HTTP.

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
java -javaagent:opentelemetry-javaagent.jar -jar app.jar
```

Download the agent from the [OpenTelemetry Java documentation](https://opentelemetry.io/docs/zero-code/java/agent/). `talaria init --stack java` writes the environment only; it does not fetch the jar or pin an agent version.

## Verify

Start the app and send one request. Open **Performance** in the [dashboard](https://one.newtalaria.com) and filter by `service.name` = `your-service`. Logs show under **Logs** once they are on in [project settings](/get-started/project-settings/). Nothing there? Run `talaria verify`, then check the [status codes](/guides/collectors/otlp/#limits-and-status-codes).
