---
title: Dart SDK
description: Quick setup for the talaria package — install, init, and capture the first exception. HTTP tracing, logs, analytics, and feature flags.
sdk: dart
package: talaria
tags: [dart, install, init]
---

# Dart SDK

`talaria` (0.3.7) is the Dart client for CLI tools, VM services, and shared libraries. Flutter apps should start with [talaria_flutter](../flutter/README.md). Serverpod 4 servers should add [talaria_serverpod](../serverpod/README.md).

## Quick setup

```yaml
dependencies:
  talaria: ^0.3.7
```

```dart
import 'package:talaria/talaria.dart';

Future<void> main() async {
  await Talaria.init(TalariaOptions(
    dsn: 'https://ingest.newtalaria.com',
    apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
    release: const String.fromEnvironment('APP_RELEASE'),
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
  --dart-define=TALARIA_API_KEY=tal_live_… \
  --dart-define=APP_RELEASE=dev
```

The key decides the environment. Do not pass `environment`. Confirm with `search_errors` and `environment: development`.

## What you can do

| Capability | Where |
| --- | --- |
| Exceptions, logs, breadcrumbs, user, and tags | [Errors, logs, and breadcrumbs](errors.md) |
| Manual spans, database helpers, and `wrapHttpClient` | [Instrumentation and tracing](instrumentation.md) |
| Analytics and feature flags | [Best practices](best-practices.md) |

`runZonedTalaria` catches zone errors. There is no isolate error listener. Heatmap upload exists on this package. Screen capture is [Flutter](../flutter/navigation.md). Tracing and analytics follow [Project configuration](../../getting-started/configuration.md). Dart always fetches that document.

## Install

```yaml
dependencies:
  talaria: ^0.3.7
```

Then `dart pub get`.

## Initialization

```dart
await Talaria.init(TalariaOptions(
  dsn: 'https://ingest.newtalaria.com',
  apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
  release: const String.fromEnvironment('APP_RELEASE'),
  commitSha: const String.fromEnvironment('APP_COMMIT'),
  minLevel: SeverityLevel.warning,
  tags: {'service': 'worker'},
));
```

A second `init` is ignored.

## App init vs Project settings

Init holds the DSN, API key, release, minimum level, and tags. Tracing and analytics turn on from Project settings. There is no `remoteConfig: false` on Dart.

## API key

Pass `TALARIA_API_KEY` with `--dart-define` or from the environment your process already uses. The prefix stays `tal_live_`. A development key is for local runs. A deployed process that should report production uses a production key. Send `release` as a version or SHA.

## Verification

`captureException` then `flush`. MCP `search_errors` with `environment: development`.

## Troubleshooting

An empty `fromEnvironment` string means the define was missing at compile time. Rebuild after you add it. A rejected key is cached for about 24 hours. Restart the process after rotating it.

## Related docs

- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Flutter](../flutter/README.md)
- [Serverpod](../serverpod/README.md)
- [Configuration](../../getting-started/configuration.md)
