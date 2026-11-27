---
title: Node.js logs
description: How Node.js sends logs, and when to use a collector.
section: sdk
order: 54
---

The Node SDK sends errors and traces. Process or file logs belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [Node.js](/sdk/javascript/node/), [Node.js configuration](/sdk/javascript/node/configuration/).
