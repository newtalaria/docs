---
title: Flutter tracing
description: Wrap application HTTP and continue W3C traceparent into a Serverpod API once tracing is on in Project settings.
sdk: flutter
package: talaria_flutter
tags: [flutter, tracing, http]
---

# Flutter tracing

Turn tracing on under [Project settings](../../getting-started/configuration.md). Span APIs match the Dart SDK. Successful transactions follow the traces sample rate. Error transactions are always sent.

```dart
await TalariaFlutter.init(TalariaOptions(
  dsn: 'https://ingest.newtalaria.com',
  apiKey: const String.fromEnvironment('TALARIA_API_KEY'),
  release: const String.fromEnvironment('APP_RELEASE'),
));
```

## Screen transactions

[TalariaNavigatorObserver](navigation.md) and `setScreen` start a short INTERNAL transaction and finish it on idle. Use them for page-load timing. Start your own transaction for a multi-step user action.

## Application HTTP

```dart
final httpClient = Talaria.wrapHttpClient(http.Client());
```

Do not wrap Talaria’s ingest client. There is no `talaria_dio` package — wrap Dio with a CLIENT span and `traceparent` injection yourself when needed (skip Talaria ingest URLs).

## Flavors and dart-define

```bash
flutter run \
  --dart-define=TALARIA_API_KEY=tal_live_… \
  --dart-define=APP_RELEASE=1.4.2+42
```

The API key decides the environment. Give each flavor its own key — a staging build uses a staging key, a production build uses a production key — so those issues stay separate. Set `release` from the build number or commit SHA for release health. A local run still sends a version or SHA as `release`.

## Continue into Serverpod

When this app calls a Serverpod API that runs `talaria_serverpod`, outbound `traceparent` becomes the parent of the Relic SERVER span. The waterfall crosses the process boundary.

> [!NOTE]
> Error events from Flutter hooks attach `traceId` / `spanId` when a screen or HTTP span is in scope, so Issues can open the trace.

Session replay and Web Vitals come from the browser SDK — use it on web surfaces that are not Flutter.

## Related

- [Flutter hub](README.md)
- [Navigation](navigation.md)
- [Configuration](../../getting-started/configuration.md)
- [Troubleshooting](troubleshooting.md)
