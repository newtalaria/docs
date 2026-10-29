---
title: 'Flutter errors, logs, and breadcrumbs'
description: >-
  Capture exceptions, logs, breadcrumbs, and user context in flutter with
  Talaria.
package: talaria_flutter
tags:
  - flutter
  - errors
  - logs
  - breadcrumbs
  - identity
id: flutter-errors
navTitle: Errors and logs
type: guide
section: platforms
platform:
  - flutter
feature:
  - issues
  - logs
order: 20
lastReviewed: '2026-10-29'
owner: docs
---
# Flutter errors, logs, and breadcrumbs

## What you're setting up

`TalariaFlutter.init` installs `FlutterError.onError` and `PlatformDispatcher.onError` unless you pass `installHooks: false`. `runZonedApp` also wraps the zone and installs `ErrorWidget.builder`.

## Steps

### 1. Manual init

```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await TalariaFlutter.init(TalariaOptions(
    apiKey: const String.fromEnvironment('TALARIA_BROWSER_API_KEY'),
    release: const String.fromEnvironment('APP_RELEASE'),
    minLevel: SeverityLevel.warning,
  ));

  ErrorWidget.builder = talariaErrorWidgetBuilder();

  runApp(MyApp(
    navigatorObservers: [TalariaNavigatorObserver()],
  ));
}
```

### 2. What each hook captures

- `FlutterError.onError` captures framework assertions and build or layout failures that Flutter reports.
- `PlatformDispatcher.onError` captures uncaught platform and async errors that miss the framework.
- The zone from `runZonedApp` captures errors thrown outside the framework binding.
- `talariaErrorWidgetBuilder` captures a widget build failure once per error (`error_widget`). `runZonedApp` installs this for you.

`TalariaFlutter.isWidgetBuildError` is the predicate that keeps a broken build from sending the same widget failure on every frame.

### 3. Manual capture

Hooks do not replace `try / catch` around recoverable work.

```dart
try {
  await riskyOperation();
} catch (error, stackTrace) {
  await Talaria.captureException(
    error,
    stackTrace: stackTrace,
    context: CaptureContext(tags: {'screen': 'checkout'}),
  );
  rethrow;
}
```

### 4. Logs

Logs are the `talaria` methods this package re-exports.

```dart
final log = Talaria.logger(name: 'checkout', tags: {'screen': 'checkout'});
await log.warning('Payment method missing');
await Talaria.captureMessage(
  'Checkout failed closed',
  level: SeverityLevel.error,
);
```

### 5. Breadcrumbs

Navigation crumbs come from `TalariaNavigatorObserver`. Add your own before a step that might fail:

```dart
Talaria.addBreadcrumb(Breadcrumb(
  type: 'user',
  category: 'checkout',
  message: 'Opened payment step',
  level: 'info',
));
```

The lifecycle observer updates the `app.state` tag (`resumed`, `paused`, `detached`).

### 6. Identity and context

```dart
Talaria.setUser('user_42');
Talaria.getClient()?.setTags({'area': 'billing'});
Talaria.getClient()?.setExtra({'plan': 'pro'});
```

Init sets `platform: flutter` and a `flutter: true` tag. Runtime extras include locale, OS, and on web the renderer and user agent. Set `release` in `TalariaOptions`. Fingerprints are computed on the server.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [Flutter SDK](README.md)
- [Navigation and screens](navigation.md)
- [Instrumentation and tracing](tracing.md)
- [Best practices](configuration.md)
