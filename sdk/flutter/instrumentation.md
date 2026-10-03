---
title: Flutter instrumentation and tracing
description: Screen transactions, Talaria.wrapHttpClient, and W3C traceparent from talaria_flutter into a Serverpod API.
sdk: flutter
package: talaria_flutter
tags: [flutter, instrumentation, tracing, spans, http]
---

# Flutter instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). Span APIs match the [Dart SDK](../dart/instrumentation.md). Successful transactions follow the traces sample rate. Error transactions are always sent. HTTP uses W3C `traceparent`.

```dart
await TalariaFlutter.init(TalariaOptions(
  dsn: 'https://ingest.newtalaria.com',
  apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
  release: const String.fromEnvironment('APP_RELEASE'),
));
```

## Screen transactions

[TalariaNavigatorObserver](navigation.md) and `TalariaFlutter.setScreen` start a short INTERNAL transaction and finish it on the next idle frame (10 second cap). Use them for page-load timing. Start your own transaction for a multi-step user action. A shell route does not stay open to parent later HTTP calls.

## Application HTTP

```dart
import 'package:http/http.dart' as http;

final httpClient = Talaria.wrapHttpClient(http.Client());
```

Do not wrap Talaria's ingest client. There is no `talaria_dio` package. Wrap Dio with a CLIENT span and `traceparent` injection yourself when you need it, and skip Talaria ingest URLs.

## Manual spans

```dart
final span = Talaria.startTransaction('checkout');
try {
  await submit();
  span.setStatus(SpanStatus.ok);
} catch (error, stackTrace) {
  span.markError(message: error.toString());
  await Talaria.captureException(error, stackTrace: stackTrace);
  rethrow;
} finally {
  span.finish();
}
```

## Continue into Serverpod

When this app calls a Serverpod API that runs `talaria_serverpod`, outbound `traceparent` becomes the parent of the Relic SERVER span. The waterfall crosses the process boundary.

Error events from Flutter hooks attach `traceId` and `spanId` when a screen or HTTP span is in scope, so Issues can open the trace.

## Flavors and dart-define

```bash
flutter run \
  --dart-define=TALARIA_API_KEY=tal_live_… \
  --dart-define=APP_RELEASE=1.4.2+42
```

The API key decides the environment. Give each flavor its own key so those issues stay separate. Set `release` from the build number or commit SHA.

## Related

- [Flutter SDK](README.md)
- [Navigation and screens](navigation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Dart instrumentation](../dart/instrumentation.md)
- [Serverpod instrumentation](../serverpod/instrumentation.md)
- [Configuration](../../getting-started/configuration.md)
- [Troubleshooting](troubleshooting.md)
