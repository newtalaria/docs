---
title: Serverpod instrumentation and tracing
description: Relic SERVER spans, Postgres CLIENT spans, FutureCall CONSUMER traces, and outbound HttpClient traceparent in talaria_serverpod.
sdk: serverpod
package: talaria_serverpod
tags: [serverpod, instrumentation, tracing, spans, http, postgres]
---

# Serverpod instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). Successful transactions follow the traces sample rate. Error transactions are always sent. Spans use the OpenTelemetry span model. Inbound and outbound HTTP use W3C `traceparent`.

`interceptDatabase` is safe to register before `init`. It no-ops until a client exists and tracing is enabled.

## Relic HTTP

`TalariaServerpod.attach` adds middleware on the API server and on the web server when that server exists. Each endpoint RPC and web route opens a SERVER span named `{METHOD} {route}`. An inbound `traceparent` is the parent. A streaming method keeps one SERVER span for the stream, not one per chunk.

A Flutter app using `Talaria.wrapHttpClient` continues into this span. The waterfall crosses the process boundary.

These paths are skipped: ingest (`ingest` and `ingestBatch`), Insights, `/livez`, `/readyz`, `/startupz`, `/robots.txt`, `/favicon.ico`, and `/.well-known/`.

## Postgres

`databaseInterceptor: TalariaServerpod.interceptDatabase` wraps the session database. ORM queries and `unsafeQuery` become CLIENT spans with `db.system.name`. When raw SQL is available it is sanitized. Otherwise the span carries a stand-in such as `SELECT Product`. Bind values are not sent. Each repeated query is its own span, so an N+1 stays visible.

FutureCalls with no HTTP span in scope get a CONSUMER transaction named `FutureCall.{name}`. That transaction is not adopted from another session.

## Outbound HTTP

`dart:io` `HttpClient` created after `TalariaServerpod.init` sends `traceparent` and records a CLIENT span while a request span is open. Ingest URLs are skipped.

`package:http` is not patched. Wrap it:

```dart
import 'package:http/http.dart' as http;

final httpClient = Talaria.wrapHttpClient(http.Client());
```

Never wrap the SDK ingest client.

## Manual spans

Redis and other caches are opt-in.

```dart
final span = Talaria.startSpan('charge', kind: SpanKind.client);
try {
  await charge();
  span.setStatus(SpanStatus.ok);
} catch (error, stackTrace) {
  span.markError(message: error.toString());
  await Talaria.captureException(error, stackTrace: stackTrace);
  rethrow;
} finally {
  span.finish();
}
```

## Related

- [Serverpod SDK](README.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Dart instrumentation](../dart/instrumentation.md)
- [Flutter instrumentation](../flutter/instrumentation.md)
- [Configuration](../../getting-started/configuration.md)
