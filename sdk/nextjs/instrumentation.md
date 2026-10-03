---
title: Next.js instrumentation and tracing
description: Client pageload and App Router navigation, server actions, route handlers, and outgoing Node HTTP in @newtalaria/nextjs. Edge does not record spans.
sdk: nextjs
package: "@newtalaria/nextjs"
tags: [nextjs, instrumentation, tracing, spans, http]
---

# Next.js instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). The client and the Node server apply that document. Successful transactions follow the traces sample rate. Error transactions are always sent. Spans use the OpenTelemetry span model. Outgoing HTTP carries W3C `traceparent`.

## Client

`initClient` records the same browser spans as [`@newtalaria/browser`](../javascript/instrumentation.md): pageload, History changes, fetch/XHR, and web vitals. It also listens for `popstate` and the Navigation API so App Router navigations that skip History still start a navigation transaction.

`ErrorBoundary`, `Profiler`, and `instrumentReactRouter` are re-exported from `@newtalaria/nextjs/client`. See [React instrumentation](../react/instrumentation.md).

## Server

`initServer` inits the Node client and patches outgoing `http`, `https`, and `fetch` once tracing is on. Talaria's own ingest URL is skipped. The patch waits for project config, so a cold start still continues `traceparent` after the document arrives.

Wrap Server Actions and Route Handlers yourself. Next.js does not call these for you:

```javascript
import { withServerAction, withRouteHandler } from '@newtalaria/nextjs/server';

export const checkout = withServerAction('checkout', async (formData) => {
  // ...
});

export const GET = withRouteHandler('GET /api/health', async () => {
  return Response.json({ ok: true });
});
```

`withServerAction` opens an INTERNAL span named `action <name>`. `withRouteHandler` opens a SERVER span named `route <name>`. A thrown error is captured and the span status is set to error.

`captureRequestError(error, request)` is the body of Next.js `onRequestError`. It records the path and method on the event.

Manual spans use `Talaria.startSpan` from `@newtalaria/nextjs/server`.

Database wrappers (`wrapPg`, `wrapMysql2`, `wrapRedis`) live on `@newtalaria/node`. You can use them from server code with `getNodeClient()` after `initServer`. See [Node instrumentation](../node/instrumentation.md).

## Edge

`initEdge` captures exceptions and messages. It does not open spans, inject `traceparent`, or fetch project config. Keep edge work on `captureException` / `captureMessage`.

## Related

- [Next.js SDK](README.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Configuration](../../getting-started/configuration.md)
