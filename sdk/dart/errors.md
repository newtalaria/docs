---
title: 'Dart errors, logs, and breadcrumbs'
description: 'Capture exceptions, logs, breadcrumbs, and user context in dart with Talaria.'
package: talaria
tags:
  - dart
  - errors
  - logs
  - breadcrumbs
  - identity
id: dart-errors
navTitle: Errors and logs
type: guide
section: platforms
platform:
  - dart
feature:
  - issues
  - logs
order: 20
lastReviewed: '2026-10-29'
owner: docs
---
# Dart errors, logs, and breadcrumbs

## What you're setting up

Capture exceptions, logs, breadcrumbs, and user context in dart with Talaria.

## Steps

### 1. Errors

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
    apiKey: const String.fromEnvironment('TALARIA_BROWSER_API_KEY'),
    release: const String.fromEnvironment('TALARIA_RELEASE'),
  ));
  await runAppWork();
});
```

Zone errors are captured. Errors in another isolate are not.

### 2. Logs

```dart
final log = Talaria.logger(name: 'billing', tags: {'area': 'billing'});
await log.warning('Payment method missing');

await Talaria.error('Charge declined');
```

Levels are `debug`, `info`, `warning`, `error`, and `fatal`. `warn` is `warning`.

### 3. Breadcrumbs

```dart
Talaria.addBreadcrumb(Breadcrumb(
  type: 'default',
  category: 'billing',
  message: 'Charge started',
  level: 'info',
));
```

The trail attached to an error holds up to 50 crumbs. Query crumbs from `DbSpan` share that buffer and cannot evict the other crumbs past their own cap.

### 4. Identity and context

`setUser` is on the facade. `setTags` and `setExtra` are on `TalariaClient`.

```dart
Talaria.setUser('user_42');
Talaria.getClient()?.setTags({'area': 'billing'});
Talaria.getClient()?.setExtra({'plan': 'pro'});
```

`Talaria.anonymousId` and `Talaria.sessionId` are the ids analytics uses. Set `release` and `commitSha` in `TalariaOptions`. Fingerprints are computed on the server.

Call `await Talaria.flush()` before a short-lived process exits.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [Dart SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Best practices](configuration.md)
