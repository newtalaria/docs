---
title: PHP logs
description: How PHP sends logs, and when to use a collector.
section: sdk
order: 94
---

Official SDKs send errors and traces. Application or infrastructure **logs** belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [PHP](/sdk/php/), [PHP configuration](/sdk/php/configuration/).
