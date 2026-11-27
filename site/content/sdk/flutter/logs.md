---
title: Flutter logs
description: How Flutter sends logs, and when to use a collector.
section: sdk
order: 76
---

The Flutter SDK sends errors and traces. It does not tail device or file logs. Application or infrastructure **logs** belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [Flutter](/sdk/flutter/), [Flutter configuration](/sdk/flutter/configuration/).
