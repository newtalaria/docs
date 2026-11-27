---
title: Dart tracing
description: Manual spans and batched export on talaria 0.4.1.
section: sdk
order: 63
---

```dart
final span = Talaria.startSpan('charge', kind: SpanKind.client);
try {
  await charge();
  span.setStatus(SpanStatus.ok);
} catch (e, st) {
  span.markError(message: e.toString());
  await Talaria.captureException(e, stackTrace: st);
  rethrow;
} finally {
  span.finish();
}
```

Finished spans are batched (see [configuration](/sdk/dart/configuration/)). For `package:http`:

```dart
final httpClient = Talaria.wrapHttpClient(http.Client());
```

Never wrap the SDK ingest client. Tracing follows [project settings](/get-started/project-settings/).
