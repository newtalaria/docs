---
title: Flutter best practices
description: Release, sampling, analytics, feature flags, and screen heatmap consent for talaria_flutter.
sdk: flutter
package: talaria_flutter
tags: [flutter, analytics, feature-flags, heatmaps, sampling, release]
---

# Flutter best practices

## Release

Pass `APP_RELEASE` as the build name and number (`1.4.2+42`) or the git SHA. Each flavor can share the version and still use its own API key so development and production stay apart.

## API key and environment

The API key chooses the environment. Do not pass `environment` in `TalariaOptions`. `--dart-define=TALARIA_API_KEY=…` is compiled in. Rebuild after you change it. A rejected key is cached for about 24 hours.

## Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. Screen transactions are short on purpose. A response with `retry: false` stops that signal until the process restarts.

## Project settings

Tracing, analytics, and heatmaps follow [Project configuration](../../getting-started/configuration.md). Dart always fetches `sdk/getConfig`.

## Analytics

Enable Analytics in Project settings. `TalariaNavigatorObserver` emits `$screen` for named routes. On web, `$pageview` is sent when the browser path changes. Unnamed routes are skipped. `TalariaFlutter.setScreen` takes an optional title for shells that do not push a route.

```dart
await Talaria.analytics.track(
  'Checkout Started',
  properties: {'plan': 'pro'},
);
```

Call `Talaria.analytics.optIn()` after the person agrees, and `optOut()` to stop. This package does not read a web cookie banner. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

```dart
final on = await Talaria.flags.boolVariation('new-checkout', false);
```

Flags are the `talaria` client. Remote evaluate is the right path on a device. The default is returned when the flag is off or the read times out (the client waits up to about three seconds on a cold start, then uses the default).

## Heatmaps

Enable heatmaps and analytics, then wrap the tree:

```dart
MaterialApp(
  navigatorObservers: [TalariaNavigatorObserver()],
  builder: (context, child) => TalariaScreenCapture(
    child: child ?? const SizedBox.shrink(),
  ),
)
```

Password fields are covered by default. `TalariaHeatmapPrivacy`, `TalariaMask`, `TalariaUnmask`, and `TalariaHeatmapAnchor` adjust a region when you need that. Heatmaps record taps, scroll depth, and snapshots of the Flutter view.

## Privacy in events

Prefer an opaque user id in `setUser`. Do not put tokens into `setExtra` or breadcrumb `data`. Route names become tags, so keep them stable and free of raw ids when you can. Use `setScreen` with a template (`/orders/detail`) rather than `/orders/98421`.

## Verify

`search_errors` with `environment: development` after a local run. Switch the dashboard shell to Development when the project also has a production key.

## Related

- [Flutter SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Navigation and screens](navigation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Troubleshooting](troubleshooting.md)
