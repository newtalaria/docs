---
title: Dart instrumentation and tracing
description: Manual spans, DbSpan, and Talaria.wrapHttpClient with W3C traceparent in the talaria package.
sdk: dart
package: talaria
tags: [dart, instrumentation, tracing, spans, http]
---

# Dart instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). Successful transactions follow the traces sample rate. Error transactions are always sent. Spans use the OpenTelemetry span model. `wrapHttpClient` sets W3C `traceparent` on outbound requests.

Do not pass a wrapped client in as the SDK's own ingest client.

## Manual spans

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

`startTransaction` opens a root span (`SpanKind.internal` by default). Pass `parent: Traceparent.parse(...)` to continue a trace you read from an incoming header. `getTraceparent()` returns the active header, or null when tracing is idle.

`setRecordQuerySpans(false)` pauses query spans. `withoutQuerySpans` pauses them for one callback.

## HTTP

```dart
import 'package:http/http.dart' as http;

final httpClient = Talaria.wrapHttpClient(http.Client());
final response = await httpClient.get(Uri.parse('https://api.example.com/health'));
```

The wrapper records a CLIENT span and sets `traceparent` while a trace is active and tracing is on. Ingest URLs are skipped.

## Database

There is no automatic ORM hook in this package. Time a query with `DbSpan`:

```dart
final client = Talaria.getClient()!;
await DbSpan.trace(
  client,
  system: 'postgresql',
  sql: 'SELECT id FROM accounts WHERE id = @id',
  run: () => database.query(sql),
);
```

The span is CLIENT, with `db.system.name` and a sanitized statement. A query breadcrumb is added. `DbSpan.traceOperation` is the same helper when you already know the operation and table and do not want to pass SQL.

## Related

- [Dart SDK](README.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Flutter tracing](../flutter/instrumentation.md)
- [Serverpod tracing](../serverpod/instrumentation.md)
- [Configuration](../../getting-started/configuration.md)
