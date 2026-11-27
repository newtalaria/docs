---
title: Next.js tracing
description: Server and client tracing follow project settings.
section: sdk
order: 43
---

Server spans come from the Node entrypoint; client traces come from the browser entrypoint. Both follow [project settings](/get-started/project-settings/). Keep the two bundles disjoint so Node `http` never lands in the client. See the [Next.js hub](/sdk/javascript/nextjs/) and [Node tracing](/sdk/javascript/node/tracing/).
