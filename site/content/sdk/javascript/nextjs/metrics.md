---
title: Next.js metrics
description: How Next.js sends metrics over OTLP/HTTP.
section: sdk
order: 45
---

Official SDKs do not replace an OpenTelemetry metrics exporter. Send service or host metrics over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Metrics show in the dashboard once they are on in [project settings](/get-started/project-settings/).

Related: [Next.js](/sdk/javascript/nextjs/), [Next.js configuration](/sdk/javascript/nextjs/configuration/).
