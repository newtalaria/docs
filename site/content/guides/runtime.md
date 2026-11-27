---
title: Runtime
description: Read logs, metrics, and service health from OpenTelemetry data you already export to Talaria.
section: guides
order: 160
---

Runtime is the logs and metrics view for services that export OTLP/HTTP to Talaria. Rows group by `service.name`, environment, and deployment from resource attributes. Official language SDKs are complementary: they send errors and traces; a [collector](/guides/collectors/) or an upstream OpenTelemetry SDK sends host and app logs and metrics.

## Send data

Point the exporter at `https://ingest-nz1.newtalaria.com/otlp` with `http/protobuf` and `Authorization: Bearer` plus a secret key. Logs need `logs:write`. Limits and status codes: [OTLP/HTTP](/guides/collectors/otlp/).

Enable logs and metrics in [project settings](/get-started/project-settings/) if they are off. Then open **Logs** and **Performance** in the [dashboard](https://one.newtalaria.com), and filter by `service.name`.

MCP can search logs with `search_logs` after you [connect](/agents/mcp/).

## Alerts

You can configure alerts of kind `gauge` or `logRate` in the project. Talaria does not create issues automatically from Kubernetes gauges such as failed pods, container restarts, or disk pressure. Set the threshold you want, or watch the dashboard.

## Related

- [Collectors](/guides/collectors/)
- [OTLP reference](/reference/otlp/)
- [Billing](/billing/) — metered volume is explained on [pricing](https://www.newtalaria.com/pricing)
