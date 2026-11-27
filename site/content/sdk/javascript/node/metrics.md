---
title: Node.js metrics
description: How Node.js sends metrics over OTLP/HTTP.
section: sdk
order: 55
---

Official SDKs do not replace an OpenTelemetry metrics exporter. Send service or host metrics over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Metrics show in the dashboard once they are on in [project settings](/get-started/project-settings/).

Related: [Node.js](/sdk/javascript/node/), [Node.js configuration](/sdk/javascript/node/configuration/).
