---
title: Dart errors, logs, and breadcrumbs
description: captureException, runZonedTalaria, TalariaLogger, breadcrumbs, and setUser on the talaria package.
sdk: dart
package: talaria
tags: [dart, errors, logs, breadcrumbs, identity]
---

# Dart errors, logs, and breadcrumbs

## Errors

```dart
try {
  await charge();
} catch (error, stackTrace) {
  await Talaria.captureException(
    error,
    stackTrace: stackTrace,
    context: CaptureContext(tags: {'area': 'billing'}),
  );
  rethrow;
}
```

```dart
await Talaria.captureMessage(
  'Checkout failed closed',
  level: SeverityLevel.error,
);
```

`minLevel: SeverityLevel.warning` drops info and debug. Exceptions default to error.

`runZonedTalaria` captures errors that escape the zone:

```dart
await runZonedTalaria(() async {
  await Talaria.init(TalariaOptions(
    dsn: 'https://ingest.newtalaria.com',
    apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
    release: const String.fromEnvironment('APP_RELEASE'),
  ));
  await runAppWork();
});
```

Zone errors are captured. Errors in another isolate are not.

## Logs

```dart
final log = Talaria.logger(name: 'billing', tags: {'area': 'billing'});
await log.warning('Payment method missing');

await Talaria.error('Charge declined');
```

Levels are `debug`, `info`, `warning`, `error`, and `fatal`. `warn` is `warning`.

## Breadcrumbs

```dart
Talaria.addBreadcrumb(Breadcrumb(
  type: 'default',
  category: 'billing',
  message: 'Charge started',
  level: 'info',
));
```

The trail attached to an error holds up to 50 crumbs. Query crumbs from `DbSpan` share that buffer and cannot evict the other crumbs past their own cap.

## Identity and context

`setUser` is on the facade. `setTags` and `setExtra` are on `TalariaClient`.

```dart
Talaria.setUser('user_42');
Talaria.getClient()?.setTags({'area': 'billing'});
Talaria.getClient()?.setExtra({'plan': 'pro'});
```

`Talaria.anonymousId` and `Talaria.sessionId` are the ids analytics uses. Set `release` and `commitSha` in `TalariaOptions`. Fingerprints are computed on the server.

Call `await Talaria.flush()` before a short-lived process exits.

## Related

- [Dart SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
