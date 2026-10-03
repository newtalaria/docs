---
title: Node.js errors, logs, and breadcrumbs
description: uncaughtException, captureException, captureMessage, breadcrumbs, and setUser on @newtalaria/node.
sdk: node
package: "@newtalaria/node"
tags: [node, errors, logs, breadcrumbs, identity]
---

# Node.js errors, logs, and breadcrumbs

## Errors

After init, `uncaughtException` and `unhandledRejection` are captured. Catch recoverable failures yourself:

```javascript
import { Talaria } from '@newtalaria/node';

try {
  await charge();
} catch (error) {
  await Talaria.captureException(error, {
    tags: { area: 'billing' },
  });
  throw error;
}
```

## Logs

There is no `logger()` on Node. That method is the browser SDK. Record a message with `captureMessage`. `minLevel: 'warning'` drops info and debug.

```javascript
await Talaria.captureMessage('Payment method missing', 'warning');
await Talaria.captureMessage('Charge declined', 'error');
```

## Breadcrumbs

Add a crumb before work that might fail. Database wrappers add query crumbs on their own. The trail is attached to the next error.

```javascript
Talaria.addBreadcrumb({
  type: 'default',
  category: 'billing',
  message: 'Charge started',
  level: 'info',
});
```

## Identity and context

```javascript
Talaria.setUser({ id: 'user_42' });
Talaria.setContext('order', { id: 'ord_1' });
Talaria.setExtra('plan', 'pro');
```

Tags that apply to the whole process belong in init (`tags: { service: 'api' }`). Per-call tags go on `captureException`. Set `release` and `commitSha` in init. Fingerprints are computed on the server.

Call `resetRequestState()` at the end of a request if you reuse the process and need a clean scope for the next one. `handleHttpRequest` finishes the HTTP span when the response ends.

In a short-lived script, `await Talaria.flush()` before exit so the batch is sent.

## Related

- [Node.js SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
