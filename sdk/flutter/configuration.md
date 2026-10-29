---
title: Flutter configuration
description: >-
  Release, sampling, analytics, feature flags, and screen heatmap consent for
  talaria_flutter.
package: talaria_flutter
tags:
  - flutter
  - analytics
  - feature-flags
  - heatmaps
  - sampling
  - release
id: flutter-configuration
navTitle: Configuration
type: guide
section: platforms
platform:
  - flutter
feature:
  - analytics
  - feature-flags
order: 50
lastReviewed: '2026-10-29'
owner: docs
---
# Flutter configuration

## What you're setting up

Release, sampling, analytics, feature flags, and screen heatmap consent for talaria_flutter.

## Steps

### 1. Release

Pass `APP_RELEASE` as the build name and number (`1.4.2+42`) or the git SHA. Each flavor can share the version and still use its own API key so development and production stay apart.

### 2. API key and environment

The API key chooses the environment. Do not pass `environment` in `TalariaOptions`. `--dart-define=TALARIA_BROWSER_API_KEY=…` is compiled in. Rebuild after you change it. A rejected key is cached for about 24 hours.

### 3. Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. Screen transactions are short on purpose. A response with `retry: false` stops that signal until the process restarts.

### 4. Project settings

Tracing, analytics, and heatmaps follow [Project configuration](../../get-started/project-settings.md). Dart always fetches project configuration.

### 5. Analytics

Enable Analytics in Project settings. `TalariaNavigatorObserver` emits `$screen` for named routes. On web, `$pageview` is sent when the browser path changes. Unnamed routes are skipped. `TalariaFlutter.setScreen` takes an optional title for shells that do not push a route.

```dart
await Talaria.analytics.track(
  'Checkout Started',
  properties: {'plan': 'pro'},
);
```

Call `Talaria.analytics.optIn()` after the person agrees, and `optOut()` to stop. This package does not read a web cookie banner. See [Product analytics setup](../../features/analytics.md).

### 6. Feature flags

```dart
final on = await Talaria.flags.boolVariation('new-checkout', false);
```

Flags are the `talaria` client. Remote evaluate is the right path on a device. The default is returned when the flag is off or the read times out (the client waits up to about three seconds on a cold start, then uses the default).

### 7. Heatmaps

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

### 8. Privacy in events

Prefer an opaque user id in `setUser`. Do not put tokens into `setExtra` or breadcrumb `data`. Route names become tags, so keep them stable and free of raw ids when you can. Use `setScreen` with a template (`/orders/detail`) rather than `/orders/98421`.

## Check it worked

`search_issues` with `environment: development` after a local run. Switch the dashboard shell to Development when the project also has a production key.

## Next steps

- [Flutter SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Navigation and screens](navigation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Troubleshooting](troubleshooting.md)
