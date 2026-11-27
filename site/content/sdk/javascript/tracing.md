---
title: JavaScript tracing
description: Browser tracing follows project settings. Use the Node or Next.js packages on the server.
section: sdk
order: 23
---

Browser tracing, analytics, and replay follow [project settings](/get-started/project-settings/), not a one-off init flag. Enable those surfaces in the dashboard and keep `init` to a publishable key, optional `release`, and `minLevel`.

Server-side HTTP and database spans belong on [`@newtalaria/node`](/sdk/javascript/node/) or [`@newtalaria/nextjs`](/sdk/javascript/nextjs/). OpenTelemetry-only services should use [OTLP/HTTP](/guides/collectors/otlp/).
