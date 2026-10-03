---
title: Serverpod SDK
description: Quick setup for talaria_serverpod — init, databaseInterceptor, Relic attach, and the first diagnostic error.
sdk: serverpod
package: talaria_serverpod
tags: [serverpod, dart, install, init]
---

# Serverpod SDK

`talaria_serverpod` (0.2.5) is the Serverpod 4 adapter. It re-exports `talaria`. Add both packages. Pass `databaseInterceptor` on the `Serverpod` constructor. Serverpod does not let you swap it later.

## Quick setup

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
    dsn: 'https://ingest.newtalaria.com',
    apiKey: Platform.environment['TALARIA_API_KEY'] ?? '',
    release: Platform.environment['TALARIA_RELEASE'] ?? 'dev',
    minLevel: SeverityLevel.warning,
    tags: {'service': 'api'},
  ));

  TalariaServerpod.attach(pod);
  await pod.start();
}
```

`interceptDatabase` no-ops until init has run and tracing is on. The key decides the environment. Confirm a thrown endpoint error with `search_errors` and `environment: development`. On shutdown, `await Talaria.flush()` and `await Talaria.close()`.

## What you can do

| Capability | Where |
| --- | --- |
| Diagnostic exceptions, logs, per-request breadcrumbs, and session user | [Errors, logs, and breadcrumbs](errors.md) |
| Relic HTTP, Postgres, FutureCall, and outbound `HttpClient` | [Instrumentation and tracing](instrumentation.md) |
| Analytics and feature flags | [Best practices](best-practices.md) |

Tracing and analytics follow [Project configuration](../../getting-started/configuration.md). Analytics calls need a caller-supplied id. There is no automatic Flutter identity on the server.

## Install

```yaml
dependencies:
  talaria: ^0.3.7
  talaria_serverpod: ^0.2.5
  serverpod: ^4.0.0
```

## Initialization

Call `TalariaServerpod.init` before `pod.start`. It inits the shared `Talaria` client with `runtime: serverpod` and installs outbound `dart:io` HTTP tracing. `TalariaServerpod.attach(pod)` adds Relic middleware on the API server and, when present, the web server.

Register `TalariaServerpod.interceptDatabase` as `databaseInterceptor` in the constructor.

Register `handleExceptionEvent` on `experimentalFeatures.diagnosticEventHandlers` so Serverpod diagnostic exceptions become events. The handler drops a few control-flow types (generic wrappers, unauthorized, a closed web socket, quota and rate-limit flow).

## App init vs Project settings

DSN, API key, release, and tags belong in `TalariaOptions`. Tracing sample rates and analytics come from Project settings. Dart always fetches `sdk/getConfig`.

## API key

Load `TALARIA_API_KEY` from the server environment. The prefix stays `tal_live_`. Use a development key locally and a production key on the deployed server. Send `TALARIA_RELEASE` as a version or SHA.

## Verification

Throw from an endpoint method. `search_errors` with `environment: development`. After you enable tracing, a request span should show under Performance for that same environment.

## Troubleshooting

If database spans never appear, the interceptor was not passed to the constructor. It cannot be added later. A rejected key is cached for about 24 hours. Restart the server after rotating it. Spans stay empty until tracing is on in Project settings.

## Related docs

- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Dart SDK](../dart/README.md)
- [Flutter](../flutter/README.md)
- [Configuration](../../getting-started/configuration.md)
