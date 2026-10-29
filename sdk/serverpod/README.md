---
title: Serverpod SDK
description: >-
  Install the Talaria serverpod SDK and capture errors, logs, and traces from
  your serverpod application.
package: talaria_serverpod
tags:
  - serverpod
  - dart
  - install
  - init
id: serverpod
navTitle: Overview
type: quickstart
section: platforms
platform:
  - serverpod
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# Serverpod SDK

## What you're setting up

`talaria_serverpod` (0.2.5) is the Serverpod 4 adapter. It re-exports `talaria`.

**What you can do**

| Capability | Where |
| --- | --- |
| Diagnostic exceptions, logs, per-request breadcrumbs, and session user | [Errors, logs, and breadcrumbs](errors.md) |
| Relic HTTP, Postgres, FutureCall, and outbound `HttpClient` | [Instrumentation and tracing](tracing.md) |
| Analytics and feature flags | [Best practices](configuration.md) |

Tracing and analytics follow [Project configuration](../../get-started/project-settings.md). Analytics calls need a caller-supplied id. There is no automatic Flutter identity on the server.

## Why use this

Add both packages. Pass `databaseInterceptor` on the `Serverpod` constructor. Serverpod does not let you swap it later.

## Before you start

Load `TALARIA_API_KEY` from the server environment.

## Steps

### 1. Quick setup

```yaml
dependencies:
  talaria: ^0.3.7
  talaria_serverpod: ^0.2.5
  serverpod: ^4.0.0
```

In the generated `server.dart`:

```dart
import 'dart:io';

import 'package:serverpod/serverpod.dart';
import 'package:talaria/talaria.dart';
import 'package:talaria_serverpod/talaria_serverpod.dart';

void run(List<String> args) async {
  final pod = Serverpod(
    args,
    Protocol(),
    Endpoints(),
    databaseInterceptor: TalariaServerpod.interceptDatabase,
    experimentalFeatures: ExperimentalFeatures(
      diagnosticEventHandlers: [
        AsEventHandler<ExceptionEvent>((event, {required space, required context}) {
          TalariaServerpod.handleExceptionEvent(event);
        }),
      ],
    ),
  );

  await TalariaServerpod.init(TalariaOptions(
    apiKey: Platform.environment['TALARIA_API_KEY'] ?? '',
    release: Platform.environment['TALARIA_RELEASE'] ?? 'dev',
    minLevel: SeverityLevel.warning,
    tags: {'service': 'api'},
  ));

  TalariaServerpod.attach(pod);
  await pod.start();
}
```

`interceptDatabase` no-ops until init has run and tracing is on. The key decides the environment. This SDK logs one warning when the key is a publishable `tal_pk_` key; use a secret `tal_sk_` key on the server. Confirm a thrown endpoint error with `search_issues` and `environment: development`. On shutdown, `await Talaria.flush()` and `await Talaria.close()`.

### 2. Install

```yaml
dependencies:
  talaria: ^0.3.7
  talaria_serverpod: ^0.2.5
  serverpod: ^4.0.0
```

### 3. Initialization

Call `TalariaServerpod.init` before `pod.start`. It inits the shared `Talaria` client with `runtime: serverpod` and installs outbound `dart:io` HTTP tracing. `TalariaServerpod.attach(pod)` adds Relic middleware on the API server and, when present, the web server.

Register `TalariaServerpod.interceptDatabase` as `databaseInterceptor` in the constructor.

Register `handleExceptionEvent` on `experimentalFeatures.diagnosticEventHandlers` so Serverpod diagnostic exceptions become events. The handler drops a few control-flow types (generic wrappers, unauthorized, a closed web socket, quota and rate-limit flow).

### 4. App init vs Project settings

URL, API key, release, and tags belong in `TalariaOptions`. Tracing sample rates and analytics come from Project settings. Dart always fetches project configuration.

### 5. API key

Publishable keys look like `tal_pk_<env>_nz1_…` and secret keys look like `tal_sk_<env>_nz1_…`. Use a development key locally and a production key on the deployed server. Send `TALARIA_RELEASE` as a version or SHA.

## Check it worked

Throw from an endpoint method. `search_issues` with `environment: development`. After you enable tracing, a request span should show under Performance for that same environment.

## Troubleshooting

If database spans never appear, the interceptor was not passed to the constructor. It cannot be added later. A rejected key is cached for about 24 hours. Restart the server after rotating it. Spans stay empty until tracing is on in Project settings.

## Next steps

- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [Dart SDK](../dart/README.md)
- [Flutter](../flutter/README.md)
- [Configuration](../../get-started/project-settings.md)
