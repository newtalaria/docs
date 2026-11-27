---
title: Next.js logs
description: How Next.js sends logs, and when to use a collector.
section: sdk
order: 44
---

The client entrypoint behaves like the browser SDK (errors and traces, not file logs). On the server, send application logs with a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/). Keep the two bundles disjoint. Enable Logs in [project settings](/get-started/project-settings/).

Related: [Next.js](/sdk/javascript/nextjs/), [Next.js configuration](/sdk/javascript/nextjs/configuration/).
