---
title: Flutter error hooks
description: How talaria_flutter captures framework, platform, zone, and widget-build failures.
sdk: flutter
package: talaria_flutter
tags: [flutter, errors]
---

# Flutter error hooks

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

- `FlutterError.onError` — framework assertions and build/layout failures that Flutter reports.
- `PlatformDispatcher.onError` — uncaught platform / async errors that miss the framework.
- Zone (via `runZonedApp`) — errors thrown outside the framework binding.
- `talariaErrorWidgetBuilder` — widget build failures, once per error (`error_widget`). `runZonedApp` installs this for you.

> [!NOTE]
> `TalariaFlutter.isWidgetBuildError` is the predicate used to de-dupe widget-library failures so a broken build does not flood ingest.

## Manual capture

Hooks do not replace `try / catch` around recoverable work. Prefer a scoped logger:

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

## Platform tag and extras

Init sets `platform: flutter` and a `flutter: true` tag. Runtime extras include locale, OS, and on web the renderer / user agent. Lifecycle updates `app.state` (resumed, paused, detached).

## Related

- [Flutter hub](README.md)
- [Navigation](navigation.md)
- [Tracing](tracing.md)
