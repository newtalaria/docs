---
title: JavaScript errors, logs, and breadcrumbs
description: captureException, logger, breadcrumbs, setUser, and release on @newtalaria/browser.
sdk: javascript
package: "@newtalaria/browser"
tags: [javascript, errors, logs, breadcrumbs, identity]
---

# JavaScript errors, logs, and breadcrumbs

## Errors

`window.onerror` and `unhandledrejection` are captured after init. Recoverable failures still belong in `try / catch`:

```javascript
try {
  await charge();
} catch (error) {
  await Talaria.captureException(error, {
    tags: { area: 'billing' },
  });
  throw error;
}
```

`captureMessage` records a message without an exception object. With `minLevel: 'warning'`, info and debug messages are dropped. Pass a level of `warning`, `error`, or `fatal` when you need the message in Issues.

```javascript
await Talaria.captureMessage('Checkout failed closed', 'error');
```

## Logs

`logger()` returns a scoped logger. Severity methods on `Talaria` send the same stream.

```javascript
const log = Talaria.logger({ tags: { feature: 'checkout' } });
await log.warn('Payment method missing');
await log.captureException(err);

await Talaria.info('Cache warmed');
await Talaria.error('Charge declined');
```

Levels are `debug`, `info`, `warning`, `error`, and `fatal`. `warn` is `warning`.

## Breadcrumbs

The SDK records console, network, and navigation crumbs and attaches the trail to the next error. Add your own:

```javascript
Talaria.addBreadcrumb({
  type: 'user',
  category: 'checkout',
  message: 'Opened payment step',
  level: 'info',
});
```

The buffer keeps a short trail (errors attach up to the last 50).

## Identity and context

```javascript
Talaria.setUser({ id: 'user_42', email: 'ada@example.com' });
Talaria.setContext('cart', { items: 3 });
Talaria.setExtra('plan', 'pro');
Talaria.withTags({ area: 'billing' });
```

Set `release` and `commitSha` in init. The release string must match the release used for [source maps](source-maps.md). Issue fingerprints are computed on the server.

Put emails and other direct identifiers only where you mean to store them. Prefer an opaque user id in `setUser` when that is enough to find the session.

## Related

- [JavaScript SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
