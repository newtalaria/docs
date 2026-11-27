---
title: Serverpod metrics
description: How Serverpod sends metrics over OTLP/HTTP.
section: sdk
order: 85
---

Official SDKs do not replace an OpenTelemetry metrics exporter. Send service or host metrics over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Metrics show in the dashboard once they are on in [project settings](/get-started/project-settings/).

Related: [Serverpod](/sdk/serverpod/), [Serverpod configuration](/sdk/serverpod/configuration/).
