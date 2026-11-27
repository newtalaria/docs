---
title: Silverstripe metrics
description: How Silverstripe sends metrics over OTLP/HTTP.
section: sdk
order: 115
---

Official SDKs do not replace an OpenTelemetry metrics exporter. Send service or host metrics over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Metrics show in the dashboard once they are on in [project settings](/get-started/project-settings/).

Related: [Silverstripe](/sdk/silverstripe/), [Silverstripe configuration](/sdk/silverstripe/configuration/).
