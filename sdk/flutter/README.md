---
title: Flutter SDK
description: Quick setup for talaria_flutter — runZonedApp, the first error, routes, and screen heatmaps.
sdk: flutter
package: talaria_flutter
tags: [flutter, dart, install, init, errors]
---

# Flutter SDK

`talaria_flutter` (0.2.7) adds framework error hooks, zone bootstrap, navigator route tags, and screen heatmaps on top of `talaria`. It re-exports `talaria`. You do not add the core package unless a shared Dart library needs it on its own.

## Quick setup

```yaml
dependencies:
  talaria_flutter: ^0.2.7
```

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

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorObservers: [TalariaNavigatorObserver()],
      home: const HomePage(),
    );
  }
}
```

```bash
flutter run \
  --dart-define=TALARIA_API_KEY=tal_live_… \
  --dart-define=APP_RELEASE=1.4.2+42
```

Then capture one error and flush:

```dart
await Talaria.captureException(
  Exception('talaria hello'),
  stackTrace: StackTrace.current,
);
await Talaria.flush();
```

The key decides the environment. A local run uses a development key. Confirm with `search_errors` and `environment: development`. `minLevel: warning` drops info messages. `captureException` is an error, so Issues still shows it.

## What you can do

| Capability | Where |
| --- | --- |
| Framework, platform, zone, and widget-build errors, plus logs and breadcrumbs | [Errors, logs, and breadcrumbs](errors.md) |
| Screen transactions and `wrapHttpClient` | [Instrumentation and tracing](instrumentation.md) |
| Routes, `setScreen`, and screen heatmaps | [Navigation and screens](navigation.md) |
| Analytics, feature flags, and consent | [Best practices](best-practices.md) |

Tracing, analytics, and heatmaps follow [Project configuration](../../getting-started/configuration.md). Screen heatmaps need `TalariaScreenCapture` in the tree. Automatic screen views use the route name. Unnamed routes are skipped.

## Install

```yaml
dependencies:
  talaria_flutter: ^0.2.7
```

Then `flutter pub get`.

## Initialization

`runZonedApp` wraps init and `runApp` in a zone and installs `ErrorWidget.builder`. You can call `TalariaFlutter.init` yourself and add the observer on the app. Either way, pass `TalariaNavigatorObserver` on `MaterialApp` or `CupertinoApp`.

A staging flavor uses a staging key. A production flavor uses a production key. Local runs use a development key and still send a version or SHA as `release`.

## App init vs Project settings

| App init (`TalariaOptions`) | Project settings |
| --- | --- |
| `dsn`, `apiKey`, `release`, `minLevel` | Tracing enabled and the traces sample rate |
| Tags, `beforeSend` | Analytics and heatmaps |

See [Project configuration](../../getting-started/configuration.md).

## API key

`tal_live_…` keys are public client ingest credentials. Pass the key with `--dart-define`. The server stamps the key's environment on events, spans, analytics, and heatmaps. DSN for Talaria Cloud is `https://ingest.newtalaria.com`.

## Verification

1. Run with a valid development key.
2. Trigger a framework error or call `Talaria.captureException`.
3. Dashboard Issues (switch the shell to Development) or MCP `search_errors` / `search_events`.

## Troubleshooting

See [troubleshooting](troubleshooting.md).

## Related docs

- [Errors, logs, and breadcrumbs](errors.md)
- [Navigation and screens](navigation.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
- [Troubleshooting](troubleshooting.md)
- [Configuration](../../getting-started/configuration.md)
- [Agent playbook](../../guides/add-talaria-with-an-agent.md)
