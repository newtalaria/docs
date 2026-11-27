---
title: Laravel logs
description: How Laravel sends logs, and when to use a collector.
section: sdk
order: 104
---

The Laravel adapter sends errors and traces. Application or infrastructure logs belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [Laravel](/sdk/laravel/), [Laravel configuration](/sdk/laravel/configuration/).
