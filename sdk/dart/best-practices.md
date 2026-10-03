---
title: Dart best practices
description: Release, sampling, analytics, and feature flags for the talaria package.
sdk: dart
package: talaria
tags: [dart, analytics, feature-flags, sampling, release]
---

# Dart best practices

## Release

Pass `release` as a version or git SHA through `--dart-define=APP_RELEASE=…` or your own environment. Local runs should still send one. Release health groups on that string.

## API key and environment

The API key chooses the environment. Do not add an environment field to `TalariaOptions`. Compile the define into the binary you ship. A development key is for local runs. Restart after rotating a rejected key. The failure is cached for about 24 hours.

## Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. A response with `retry: false` stops that signal until the process starts again.

## Project settings

Tracing and analytics follow [Project configuration](../../getting-started/configuration.md). Dart always fetches `sdk/getConfig`.

## Analytics

Enable Analytics in Project settings. This package has no consent-banner integration. `optIn` is the call that allows sending when you have already collected consent in the app. Server-side tools pass `userId` or `anonymousId` on the call.

```dart
await Talaria.analytics.identify('user_42', traits: {'plan': 'pro'});
await Talaria.analytics.track(
  'Invoice Sent',
  properties: {'plan': 'pro'},
  userId: 'user_42',
);
```

`page` and `screen` are on the same client. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

```dart
final on = await Talaria.flags.boolVariation('new-checkout', false);
```

`stringVariation` and `jsonVariation` take a key and a default. When you need local evaluation (a server that should not round-trip on every read), call `Talaria.flags.loadDefinitions()` once at startup. That requires `flags:definitions` on the API key. Mobile clients should stay on remote evaluate.

## Privacy in events

`setExtra` is a map of app metadata. Do not put tokens or raw queries there. `DbSpan` stores a sanitized statement, not bind values, when you pass SQL through it.

## Verify

`search_errors` with `environment: development` for a local key. `get_project_stats` analytics counts stay at 0 while analytics is off.

## Related

- [Dart SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
