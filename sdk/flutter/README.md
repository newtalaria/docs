---
title: Flutter SDK
description: Install talaria_flutter, bootstrap with runZonedApp, capture errors and routes.
sdk: flutter
package: talaria_flutter
tags: [flutter, dart, install, errors]
---

# Flutter SDK

`talaria_flutter` adds framework error hooks, zone bootstrap, navigator route tags, and lifecycle state on top of `talaria`. It re-exports `talaria`. You do not add the core package unless a shared Dart library needs it.

Session replay and Web Vitals are browser-SDK features — Flutter does not record them.

## Prerequisites / supported versions

- A Flutter app with a normal `pubspec.yaml`
- Dart SDK compatible with current `talaria_flutter` on [pub.dev](https://pub.dev/packages/talaria_flutter)
- A Talaria project and ingest API key (`tal_live_…`)

## Package name + install command

```yaml
dependencies:
  talaria_flutter: ^0.2.6
```

Then `flutter pub get`.

## Initialization

`runZonedApp` wraps init and `runApp` in a zone and installs `ErrorWidget.builder`. Or call `TalariaFlutter.init` yourself and add the observer on your app.

```dart
import 'package:flutter/material.dart';
import 'package:talaria_flutter/talaria_flutter.dart';

Future<void> main() async {
  await TalariaFlutter.runZonedApp(
    TalariaOptions(
      dsn: 'https://ingest.newtalaria.com',
      apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
      release: const String.fromEnvironment('APP_RELEASE'),
      minLevel: SeverityLevel.warning,
    ),
    const MyApp(),
  );
}
```

Pass `TalariaNavigatorObserver` on `MaterialApp` / `CupertinoApp` either way. Map flavors and `--dart-define` into the API key and `release`. A staging flavor uses a staging key. A production flavor uses a production key. Local runs use a development key and still send a version or SHA as `release`.

## Verify ingest

Agents should prefer MCP `send_test_event` after `setup_project`. From the app, use an **error-level** capture so Issues and `search_errors` see it (`minLevel: warning` drops default info messages):

```dart
await Talaria.captureException(
  Exception('talaria hello'),
  stackTrace: StackTrace.current,
);
await Talaria.flush();
```

Or `Talaria.captureMessage('talaria hello', level: SeverityLevel.error)`.
## App init vs Project settings

| App init (`TalariaOptions`) | Project settings (remote config) |
| --------------------------- | -------------------------------- |
| `dsn`, `apiKey`, `release`, `minLevel` | Tracing enabled + traces sample rate |
| Tags, `beforeSend` | Analytics / heatmaps enabled |
| | Session replay (N/A for Flutter) |

> [!NOTE]
> Turn tracing on under Project settings. Screen transactions are short — they finish on the next idle frame so a shell route cannot parent every RPC.

See [Project configuration](../../getting-started/configuration.md).

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials**. The key decides the environment. Each key is bound to development, test, staging, or production, and the prefix stays `tal_live_`. The server stamps that value onto events, spans, analytics, replays, and heatmaps. A deployed app that should report production uses a production key. Local install, including `setup_project`, uses a development key. Pass the key with `--dart-define` (or your flavor config):

```bash
flutter run \
  --dart-define=TALARIA_API_KEY=tal_live_… \
  --dart-define=APP_RELEASE=1.4.2+42
```

DSN for Talaria Cloud: `https://ingest.newtalaria.com`.

## Optional features

- **Errors** — always available after init ([errors](errors.md))
- **Navigation / screens** — observer + `setScreen` ([navigation](navigation.md))
- **Tracing** — enable in Project settings; wrap HTTP ([tracing](tracing.md))
- **Product analytics** — enable analytics in Project settings; `$screen` from navigator; `Talaria.analytics.track`
- **Screen heatmaps** — enable heatmaps + analytics; wrap with `TalariaScreenCapture`
- **Session replay / Web Vitals** — not on Flutter; use the browser SDK on web surfaces that are not Flutter

### Heatmaps example

```dart
MaterialApp(
  navigatorObservers: [TalariaNavigatorObserver()],
  builder: (context, child) => TalariaScreenCapture(
    child: child ?? const SizedBox.shrink(),
  ),
)
```

Password fields are covered by default. Use `TalariaHeatmapPrivacy`, `TalariaMask`, `TalariaUnmask`, and `TalariaHeatmapAnchor` as described in product docs when you need finer control.

## Verification

1. Run the app with a valid key.
2. Trigger a framework error or call `Talaria.captureException`.
3. Dashboard **Issues**, or MCP `search_errors` / `search_events` / `get_project_stats`.

## Troubleshooting

See [troubleshooting](troubleshooting.md).

## Related docs

- [Errors](errors.md)
- [Navigation](navigation.md)
- [Tracing](tracing.md)
- [Configuration](../../getting-started/configuration.md)
- [Agent playbook](../../guides/add-talaria-with-an-agent.md)

## What you get

| Integration | Behavior |
| ----------- | -------- |
| `FlutterError.onError` | Framework errors → captureException |
| `PlatformDispatcher.onError` | Platform / async errors |
| `runZonedApp` | Uncaught zone errors |
| `TalariaNavigatorObserver` | route / screen tags + short page-load transaction |
| `TalariaFlutter.setScreen` | Same short span for IndexedStack / tabs |
| Lifecycle observer | `app.state` tag |
| `talariaErrorWidgetBuilder` | Build failures (one event) |

Events are tagged with `platform: flutter`. Runtime extras include locale, OS, and on web the renderer / user agent.
