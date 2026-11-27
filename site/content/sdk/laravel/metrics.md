---
title: Laravel metrics
description: How Laravel sends metrics over OTLP/HTTP.
section: sdk
order: 105
---

Official SDKs do not replace an OpenTelemetry metrics exporter. Send service or host metrics over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Metrics show in the dashboard once they are on in [project settings](/get-started/project-settings/).

Related: [Laravel](/sdk/laravel/), [Laravel configuration](/sdk/laravel/configuration/).
