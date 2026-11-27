---
title: React logs
description: How React sends logs, and when to use a collector.
section: sdk
order: 34
---

The React package follows the browser SDK: it sends errors and traces, not file logs. Application or infrastructure **logs** belong on a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/) to `https://ingest-<cell>.newtalaria.com/otlp`. Enable Logs in [project settings](/get-started/project-settings/).

Related: [React](/sdk/javascript/react/), [React configuration](/sdk/javascript/react/configuration/).
