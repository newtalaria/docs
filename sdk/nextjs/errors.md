---
title: Next.js errors, logs, and breadcrumbs
description: Client, server, and edge captureException, logs, breadcrumbs, and user context on @newtalaria/nextjs.
sdk: nextjs
package: "@newtalaria/nextjs"
tags: [nextjs, errors, logs, breadcrumbs, identity]
---

# Next.js errors, logs, and breadcrumbs

## Client

After `initClient`, browser `onerror` / `unhandledrejection` are active. `ErrorBoundary` and `reactErrorHandler` match [React errors](../react/errors.md).

```javascript
import { Talaria } from '@newtalaria/nextjs/client';

await Talaria.captureException(error);
const log = Talaria.logger({ tags: { feature: 'checkout' } });
await log.warn('Payment method missing');
Talaria.addBreadcrumb({ type: 'user', category: 'ui', message: 'Opened checkout' });
Talaria.setUser({ id: 'user_42' });
```

## Server

`initServer` captures `uncaughtException` and `unhandledRejection` through the Node SDK. There is no `logger()` on the server. Record a message with `captureMessage`.

```javascript
import { Talaria } from '@newtalaria/nextjs/server';

await Talaria.captureException(error, {
  tags: { area: 'billing' },
});
await Talaria.captureMessage('Queue retry exhausted', 'error');
Talaria.addBreadcrumb({ type: 'default', category: 'job', message: 'Retry 2' });
Talaria.setUser({ id: 'user_42' });
Talaria.setContext('order', { id: 'ord_1' });
```

`withServerAction` and `withRouteHandler` capture thrown errors and set the span status. `captureRequestError` records Next.js request errors.

## Edge

```javascript
import { Talaria } from '@newtalaria/nextjs/edge';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.TALARIA_API_KEY,
  release: process.env.TALARIA_RELEASE,
});

await Talaria.captureException(error);
await Talaria.captureMessage('Edge rejected the request', 'error');
Talaria.addBreadcrumb({ type: 'default', message: 'Before fetch' });
Talaria.setUser({ id: 'user_42' });
Talaria.setTags({ region: 'iad1' });
```

Edge keeps a manual breadcrumb buffer and attaches it to errors. It has `setUser`, `setTags`, `setExtra`, and `setContext`. It has no `logger()`, no spans, and no analytics.

## Release

Use the same `release` on the client, server, and edge. Upload client source maps for that release. Fingerprints are computed on the server.

## Related

- [Next.js SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
