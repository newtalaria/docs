---
title: Dart logs
description: How Dart sends logs, and when to use a collector.
section: sdk
order: 64
---

Official SDKs send errors and traces. Application or infrastructure **logs** belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [Dart](/sdk/dart/), [Dart configuration](/sdk/dart/configuration/).
