---
title: Dart SDK
description: >-
  Install the Talaria dart SDK and capture errors, logs, and traces from your
  dart application.
package: talaria
tags:
  - dart
  - install
  - init
id: dart
navTitle: Overview
type: quickstart
section: platforms
platform:
  - dart
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# Dart SDK

## What you're setting up

`talaria` (0.3.7) is the Dart client for CLI tools, VM services, and shared libraries.

**What you can do**

| Capability | Where |
| --- | --- |
| Exceptions, logs, breadcrumbs, user, and tags | [Errors, logs, and breadcrumbs](errors.md) |
| Manual spans, database helpers, and `wrapHttpClient` | [Instrumentation and tracing](tracing.md) |
| Analytics and feature flags | [Best practices](configuration.md) |

`runZonedTalaria` catches zone errors. There is no isolate error listener. Heatmap upload exists on this package. Screen capture is [Flutter](../flutter/navigation.md). Tracing and analytics follow [Project configuration](../../get-started/project-settings.md). Dart always fetches that document.

## Why use this

Flutter apps should start with [talaria_flutter](../flutter/README.md). Serverpod 4 servers should add [talaria_serverpod](../serverpod/README.md).

## Before you start

Pass `TALARIA_BROWSER_API_KEY` with `--dart-define`.

## Steps

### 1. Quick setup

```yaml
dependencies:
  talaria: ^0.3.7
```

```dart
import 'package:talaria/talaria.dart';

Future<void> main() async {
  await Talaria.init(TalariaOptions(
    apiKey: const String.fromEnvironment('TALARIA_BROWSER_API_KEY'),
    release: const String.fromEnvironment('TALARIA_RELEASE'),
    minLevel: SeverityLevel.warning,
  ));

  try {
    throw StateError('talaria hello');
  } catch (error, stackTrace) {
    await Talaria.captureException(error, stackTrace: stackTrace);
  }
  await Talaria.flush();
}
```

```bash
dart run \
  --dart-define=TALARIA_BROWSER_API_KEY=tal_pk_prod_nz1_… \
  --dart-define=TALARIA_RELEASE=dev
```

The key decides the environment. This SDK refuses a secret `tal_sk_` key or a `tal_mon_` token at init. Do not pass `environment`. Confirm with `search_issues` and `environment: development`.

### 2. Install

```yaml
dependencies:
  talaria: ^0.3.7
```

Then `dart pub get`.

### 3. Initialization

```dart
await Talaria.init(TalariaOptions(
  apiKey: const String.fromEnvironment('TALARIA_BROWSER_API_KEY'),
  release: const String.fromEnvironment('TALARIA_RELEASE'),
  commitSha: const String.fromEnvironment('APP_COMMIT'),
  minLevel: SeverityLevel.warning,
  tags: {'service': 'worker'},
));
```

A second `init` is ignored.

### 4. App init vs Project settings

Init holds the URL, API key, release, minimum level, and tags. Tracing and analytics turn on from Project settings. There is no `remoteConfig: false` on Dart.

### 5. API key

Publishable keys look like `tal_pk_<env>_nz1_…`. This SDK refuses a secret `tal_sk_` key or a `tal_mon_` token at init. A development publishable key is for local runs. A deployed client that should report production uses a production publishable key. Send `release` as a version or SHA.

## Check it worked

`captureException` then `flush`. MCP `search_issues` with `environment: development`.

## Troubleshooting

An empty `fromEnvironment` string means the define was missing at compile time. Rebuild after you add it. A rejected key is cached for about 24 hours. Restart the process after rotating it.

## Next steps

- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [Flutter](../flutter/README.md)
- [Serverpod](../serverpod/README.md)
- [Configuration](../../get-started/project-settings.md)
