---
title: Flutter logs
description: How Flutter sends logs, and when to use a collector.
section: sdk
order: 76
---

Flutter sends errors and traces through the official SDK. It does not tail device or file logs. Service logs belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/). Enable Logs in [project settings](/get-started/project-settings/).

Related: [Flutter](/sdk/flutter/), [Flutter configuration](/sdk/flutter/configuration/).
