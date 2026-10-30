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
lastReviewed: '2026-10-30'
owner: docs
---

# Dart SDK

## What you're setting up

`talaria` (0.4.0) is the Dart client for CLI tools, VM services, and shared libraries.

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

A Dart VM service, CLI, or worker reads a secret `tal_sk_` key from `TALARIA_API_KEY` in its environment. Client code that ships to users (Flutter) takes a publishable `tal_pk_` key instead; use [talaria_flutter](../flutter/README.md) for that.

## Steps

### 1. Quick setup

```yaml
dependencies:
  talaria: ^0.4.0
```

```dart
import 'dart:io';

import 'package:talaria/talaria.dart';

Future<void> main() async {
  await Talaria.init(TalariaOptions(
    apiKey: Platform.environment['TALARIA_API_KEY'] ?? '',
    release: Platform.environment['TALARIA_RELEASE'],
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
TALARIA_API_KEY=tal_sk_dev_nz1_… TALARIA_RELEASE=dev dart run
```

The key decides the environment. Leave `TALARIA_URL` unset: the SDK derives `https://ingest-<cell>.newtalaria.com` from the key. The SDK checks the key grammar and checksum and refuses a `tal_mon_` token at init. Do not pass `environment`. Confirm with `search_issues` and `environment: development`.

### 2. Install

```yaml
dependencies:
  talaria: ^0.4.0
```

Then `dart pub get`.

### 3. Initialization

```dart
await Talaria.init(TalariaOptions(
  apiKey: Platform.environment['TALARIA_API_KEY'] ?? '',
  release: Platform.environment['TALARIA_RELEASE'],
  commitSha: Platform.environment['TALARIA_COMMIT_SHA'],
  minLevel: SeverityLevel.warning,
  tags: {'service': 'worker'},
));
```

A second `init` is ignored.

### 4. App init vs Project settings

Init holds the URL, API key, release, minimum level, and tags. Tracing and analytics turn on from Project settings. There is no `remoteConfig: false` on Dart.

### 5. API key

Server and CI keys are secret: `tal_sk_<env>_<cell>_…` in `TALARIA_API_KEY`. A publishable `tal_pk_<env>_<cell>_…` key is accepted on the Dart VM and logs one warning: ingest works, but releases, flag definitions (`flags:read`), and monitors need a `tal_sk_` key. A `tal_mon_` token is refused; it is only for `POST /v1/check-ins`. Use a development key locally and a production key on the deployed service. Send `release` as a version or SHA.

## Check it worked

`captureException` then `flush`. MCP `search_issues` with `environment: development`.

## Troubleshooting

An empty `TALARIA_API_KEY` means the variable is not set in the process environment. A rejected key is cached for about 24 hours. Restart the process after rotating it.

## Next steps

- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [Flutter](../flutter/README.md)
- [Serverpod](../serverpod/README.md)
- [Configuration](../../get-started/project-settings.md)
