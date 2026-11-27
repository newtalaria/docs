---
title: Serverpod logs
description: How Serverpod sends logs, and when to use a collector.
section: sdk
order: 84
---

Official SDKs send errors and traces. Application or infrastructure **logs** belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [Serverpod](/sdk/serverpod/), [Serverpod configuration](/sdk/serverpod/configuration/).
