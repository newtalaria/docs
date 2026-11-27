---
title: JavaScript logs
description: How JavaScript sends logs, and when to use a collector.
section: sdk
order: 25
---

The browser SDK sends errors and traces. It does not tail file logs. Application or infrastructure **logs** belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [JavaScript](/sdk/javascript/), [JavaScript configuration](/sdk/javascript/configuration/).
