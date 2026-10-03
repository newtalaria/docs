---
title: React errors, logs, and breadcrumbs
description: ErrorBoundary, the React 19 error handler, captureException, logger, breadcrumbs, and setUser on @newtalaria/react.
sdk: react
package: "@newtalaria/react"
tags: [react, errors, logs, breadcrumbs, identity]
---

# React errors, logs, and breadcrumbs

Browser handlers (`window.onerror`, `unhandledrejection`) are active after `Talaria.init`. This package adds two React paths.

## ErrorBoundary

```tsx
import { ErrorBoundary } from '@newtalaria/react';

export function App() {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <button type="button" onClick={reset}>
          Try again
        </button>
      )}
    >
      <Checkout />
    </ErrorBoundary>
  );
}
```

`componentDidCatch` calls `captureException` with mechanism `react` and the component stack in `extra`. The error is marked handled. `fallback` may be a node or `(error, reset) => node`.

## React 19 error handler

Pass `reactErrorHandler()` to `createRoot` / `hydrateRoot`. These errors are marked unhandled.

```tsx
import { createRoot } from 'react-dom/client';
import { reactErrorHandler } from '@newtalaria/react';

createRoot(document.getElementById('root'), {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
});
```

The default export of `@newtalaria/react` also exposes `reactErrorHandler` on the Talaria object. The named import above is the one to call from `createRoot`.

## Logs

`logger()` and the severity methods are re-exported from the browser SDK.

```javascript
import { Talaria } from '@newtalaria/react';

const log = Talaria.logger({ tags: { feature: 'checkout' } });
await log.warn('Payment method missing');
await Talaria.captureException(error);
```

## Breadcrumbs

Console, network, and navigation crumbs are recorded automatically. Add your own with `Talaria.addBreadcrumb({ type, category, message, level })`. The trail is attached to the next error.

## Identity and context

```javascript
Talaria.setUser({ id: 'user_42' });
Talaria.setContext('cart', { items: 3 });
Talaria.setExtra('plan', 'pro');
```

Set `release` in init to the same string you use for source maps. Fingerprints are computed on the server.

## Related

- [React SDK](README.md)
- [Browser errors](../javascript/errors.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
