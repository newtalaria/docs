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
  talaria: ^0.2.3
```

Then `dart pub get`.

## Initialization

```dart
import 'package:talaria/talaria.dart';

Future<void> main() async {
  await Talaria.init(TalariaOptions(
    dsn: 'https://ingest.newtalaria.com',
    apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
    environment: 'development',
    minLevel: SeverityLevel.warning,
  ));
}
```

## App init vs Project settings

Init: DSN, API key, environment, release, minLevel. Tracing/analytics: [Project configuration](../../getting-started/configuration.md). Dart always fetches remote config.

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials**. Prefer `--dart-define=TALARIA_API_KEY=…` for local runs and CI.

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
