---
title: Flutter errors, logs, and breadcrumbs
description: FlutterError, platform, zone, and ErrorWidget capture, plus logs, breadcrumbs, and setUser on talaria_flutter.
sdk: flutter
package: talaria_flutter
tags: [flutter, errors, logs, breadcrumbs, identity]
---

# Flutter errors, logs, and breadcrumbs

`TalariaFlutter.init` installs `FlutterError.onError` and `PlatformDispatcher.onError` unless you pass `installHooks: false`. `runZonedApp` also wraps the zone and installs `ErrorWidget.builder`.

## Manual init

```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await TalariaFlutter.init(TalariaOptions(
    dsn: 'https://ingest.newtalaria.com',
    apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
    release: const String.fromEnvironment('APP_RELEASE'),
    minLevel: SeverityLevel.warning,
  ));

  ErrorWidget.builder = talariaErrorWidgetBuilder();

  runApp(MyApp(
    navigatorObservers: [TalariaNavigatorObserver()],
  ));
}
```

## What each hook captures

- `FlutterError.onError` captures framework assertions and build or layout failures that Flutter reports.
- `PlatformDispatcher.onError` captures uncaught platform and async errors that miss the framework.
- The zone from `runZonedApp` captures errors thrown outside the framework binding.
- `talariaErrorWidgetBuilder` captures a widget build failure once per error (`error_widget`). `runZonedApp` installs this for you.

`TalariaFlutter.isWidgetBuildError` is the predicate that keeps a broken build from sending the same widget failure on every frame.

## Manual capture

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

## Logs

Logs are the `talaria` methods this package re-exports.

```dart
final log = Talaria.logger(name: 'checkout', tags: {'screen': 'checkout'});
await log.warning('Payment method missing');
await Talaria.captureMessage(
  'Checkout failed closed',
  level: SeverityLevel.error,
);
```

## Breadcrumbs

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

## Identity and context

```dart
Talaria.setUser('user_42');
Talaria.getClient()?.setTags({'area': 'billing'});
Talaria.getClient()?.setExtra({'plan': 'pro'});
```

Init sets `platform: flutter` and a `flutter: true` tag. Runtime extras include locale, OS, and on web the renderer and user agent. Set `release` in `TalariaOptions`. Fingerprints are computed on the server.

## Related

- [Flutter SDK](README.md)
- [Navigation and screens](navigation.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
