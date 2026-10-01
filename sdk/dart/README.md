---
title: Dart SDK
description: Install talaria — exceptions, scoped logging, breadcrumbs, and optional APM spans.
sdk: dart
package: talaria
tags: [dart, install]
---

# Dart SDK

Use `talaria` for CLI tools, VM services, and shared Dart libraries. Flutter apps should start with [talaria_flutter](../flutter/README.md). Serverpod 4 servers should add [talaria_serverpod](../serverpod/README.md).

## Prerequisites / supported versions

- Dart SDK compatible with current `talaria` on [pub.dev](https://pub.dev/packages/talaria)

## Package name + install command

```yaml
dependencies:
  talaria: ^0.3.7
```

Then `dart pub get`.

## Initialization

```dart
import 'package:talaria/talaria.dart';

Future<void> main() async {
  await Talaria.init(TalariaOptions(
    dsn: 'https://ingest.newtalaria.com',
    apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
    release: const String.fromEnvironment('APP_RELEASE'),
    minLevel: SeverityLevel.warning,
  ));
}
```

## App init vs Project settings

Init: DSN, API key, release, minLevel. The API key decides the environment. Tracing/analytics: [Project configuration](../../getting-started/configuration.md). Dart always fetches remote config.

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials**. The key decides the environment. Each key is bound to development, test, staging, or production, and the prefix stays `tal_live_`. The server stamps that value on ingest. A deployed app that should report production uses a production key. Local install uses a development key. Prefer `--dart-define=TALARIA_API_KEY=…` for local runs and CI, and send `release` as a version or SHA.

## Optional features

Enable tracing in Project settings; use `startTransaction` / `wrapHttpClient` from the Dart tracing API.

## Verification

Trigger `Talaria.captureException`, then MCP `search_errors` / `get_project_stats`.

## Troubleshooting

Rejected keys cache ~24h. Restart after rotating.

## Related docs

- [Flutter](../flutter/README.md)
- [Serverpod](../serverpod/README.md)
- [Configuration](../../getting-started/configuration.md)
