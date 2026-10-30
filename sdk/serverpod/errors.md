---
title: 'Serverpod errors, logs, and breadcrumbs'
description: >-
  Capture exceptions, logs, breadcrumbs, and user context in serverpod with
  Talaria.
package: talaria_serverpod
tags:
  - serverpod
  - errors
  - logs
  - breadcrumbs
  - identity
id: serverpod-errors
navTitle: Errors and logs
type: guide
section: platforms
platform:
  - serverpod
feature:
  - issues
  - logs
order: 20
lastReviewed: '2026-10-29'
owner: docs
---
# Serverpod errors, logs, and breadcrumbs

## What you're setting up

Capture exceptions, logs, breadcrumbs, and user context in serverpod with Talaria.

## Steps

### 1. Errors

`handleExceptionEvent` turns a Serverpod `ExceptionEvent` into `captureException` with mechanism `serverpod_diagnostic`. Register it from `diagnosticEventHandlers` as shown in the [quick setup](README.md). When the handler context is a `DiagnosticEventContext`, pass it as `context:` so the event keeps that session's trace and user.

The filter drops events that are control flow rather than defects: a generic wrapper, `ApiUnauthorizedException`, a closed web socket, and quota or rate-limit flow.

Inside an endpoint, capture a handled failure the usual way:

```dart
try {
  await charge();
} catch (error, stackTrace) {
  await Talaria.captureException(error, stackTrace: stackTrace);
  rethrow;
}
```

### 2. Logs

Logs are the `talaria` methods.

```dart
final log = Talaria.logger(name: 'billing', tags: {'area': 'billing'});
await log.warning('Payment method missing');
```

`minLevel: SeverityLevel.warning` drops info and debug.

### 3. Breadcrumbs

The core buffer is scoped to the request. A diagnostic capture reads the crumbs for that session, not another request's zone. HTTP and database work add their own crumbs.

```dart
Talaria.addBreadcrumb(Breadcrumb(
  type: 'default',
  category: 'billing',
  message: 'Charge started',
  level: 'info',
));
```

### 4. Identity and context

Do not call `Talaria.setUser` for the authenticated caller. That setter is process-wide and would leak across concurrent requests. Bind the user to the session:

```dart
TalariaServerpod.bindRequestUser(session, userId);
```

`bindRequestUser` remembers the id for that Serverpod session, stamps it on the open span, and clears it when the session closes. Empty ids are ignored.

Tags that apply to the whole process belong in `TalariaOptions.tags` (`service`, for example). Per-request tags stay on the capture context.

Set `release` in init. Fingerprints are computed on the server. Call `await Talaria.flush()` on shutdown.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [Serverpod SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Best practices](configuration.md)
- [Dart errors](../dart/errors.md)
