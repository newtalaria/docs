---
title: Flutter SDK
description: >-
  Install the Talaria flutter SDK and capture errors, logs, and traces from your
  flutter application.
package: talaria_flutter
tags:
  - flutter
  - dart
  - install
  - init
  - errors
id: flutter
navTitle: Overview
type: quickstart
section: platforms
platform:
  - flutter
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# Flutter SDK

## What you're setting up

`talaria_flutter` (0.2.7) adds framework error hooks, zone bootstrap, navigator route tags, and screen heatmaps on top of `talaria`. It re-exports `talaria`.

**What you can do**

| Capability | Where |
| --- | --- |
| Framework, platform, zone, and widget-build errors, plus logs and breadcrumbs | [Errors, logs, and breadcrumbs](errors.md) |
| Screen transactions and `wrapHttpClient` | [Instrumentation and tracing](tracing.md) |
| Routes, `setScreen`, and screen heatmaps | [Navigation and screens](navigation.md) |
| Analytics, feature flags, and consent | [Best practices](configuration.md) |

Tracing, analytics, and heatmaps follow [Project configuration](../../get-started/project-settings.md). Screen heatmaps need `TalariaScreenCapture` in the tree. Automatic screen views use the route name. Unnamed routes are skipped.

## Why use this

You do not add the core package unless a shared Dart library needs it on its own.

## Before you start

`tal_pk_prod_nz1_…` keys are public client ingest credentials.

## Steps

### 1. Quick setup

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
      apiKey: const String.fromEnvironment('TALARIA_BROWSER_API_KEY'),
      release: const String.fromEnvironment('TALARIA_RELEASE'),
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
  --dart-define=TALARIA_BROWSER_API_KEY=tal_pk_prod_nz1_… \
  --dart-define=TALARIA_RELEASE=1.4.2+42
```

Then capture one error and flush:

```dart
await Talaria.captureException(
  Exception('talaria hello'),
  stackTrace: StackTrace.current,
);
await Talaria.flush();
```

The key decides the environment. This SDK refuses a secret `tal_sk_` key or a `tal_mon_` token at init. A local run uses a development key. Confirm with `search_issues` and `environment: development`. `minLevel: warning` drops info messages. `captureException` is an error, so Issues still shows it.

### 2. Install

```yaml
dependencies:
  talaria_flutter: ^0.2.7
```

Then `flutter pub get`.

### 3. Initialization

`runZonedApp` wraps init and `runApp` in a zone and installs `ErrorWidget.builder`. You can call `TalariaFlutter.init` yourself and add the observer on the app. Either way, pass `TalariaNavigatorObserver` on `MaterialApp` or `CupertinoApp`.

A staging flavor uses a staging key. A production flavor uses a production key. Local runs use a development key and still send a version or SHA as `release`.

### 4. App init vs Project settings

| App init (`TalariaOptions`) | Project settings |
| --- | --- |
| `url`, `apiKey`, `release`, `minLevel` | Tracing enabled and the traces sample rate |
| Tags, `beforeSend` | Analytics and heatmaps |

See [Project configuration](../../get-started/project-settings.md).

### 5. API key

Pass the key with `--dart-define`. The server stamps the key's environment on events, spans, analytics, and heatmaps. Leave `url` unset on Talaria Cloud. The SDK derives `https://ingest-nz1.newtalaria.com` from the key. Set `url` only for self-host or a custom domain.

## Check it worked

1. Run with a valid development key.
2. Trigger a framework error or call `Talaria.captureException`.
3. Dashboard Issues (switch the shell to Development) or MCP `search_issues` / `search_events`.

## Troubleshooting

See [troubleshooting](troubleshooting.md).

## Next steps

- [Errors, logs, and breadcrumbs](errors.md)
- [Navigation and screens](navigation.md)
- [Instrumentation and tracing](tracing.md)
- [Best practices](configuration.md)
- [Troubleshooting](troubleshooting.md)
- [Configuration](../../get-started/project-settings.md)
- [Agent playbook](../../agents/add-talaria.md)
