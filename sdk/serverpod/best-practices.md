---
title: Serverpod best practices
description: Release, sampling, analytics, and TalariaServerpodFlags for talaria_serverpod.
sdk: serverpod
package: talaria_serverpod
tags: [serverpod, analytics, feature-flags, sampling, release]
---

# Serverpod best practices

## Release

Set `TALARIA_RELEASE` to the version or git SHA of this server build. Local runs should still send one. A Flutter client that calls this API should send its own release. The two strings describe different artifacts.

## API key and environment

The API key chooses the environment. Keep it in the server environment, not in the Flutter app's define, unless you intend the app and the server to report as the same environment. Restart after rotating a rejected key. The failure is cached for about 24 hours.

## Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. A response with `retry: false` stops that signal until the process restarts.

## Project settings

Tracing and analytics follow [Project configuration](../../getting-started/configuration.md). Register `databaseInterceptor` before the first request even though spans wait for that document. You cannot add the interceptor later.

## Analytics

Enable Analytics in Project settings. Pass `userId` or `anonymousId` yourself. The server does not copy a Flutter client's anonymous id unless you send it on the call.

```dart
await Talaria.analytics.track(
  'Invoice Sent',
  properties: {'plan': 'pro'},
  userId: userId,
);
```

See [Product analytics setup](../../analytics/setup.md).

## Feature flags

Prefer local definitions so a mid-request read does not wait on the network. The API key needs `flags:definitions`.

```dart
await TalariaServerpodFlags.ensureLocalDefinitions();
final on = await TalariaServerpodFlags.boolVariation('new-checkout', false);
```

`stringVariation` and `jsonVariation` take a key and a default. `setContext` sets the user, organization, and attributes used for evaluation. When the flag is off, or definitions have not loaded, the default is returned.

## Privacy in events

Database spans omit bind values. Do not put tokens in breadcrumb data or in a diagnostic `extra` you add yourself. `bindRequestUser` stores the user id for that session only.

## Verify

`search_errors` and, after tracing is on, a trace for one endpoint call in the same environment as the key. `get_project_stats` analytics counts stay at 0 while analytics is off.

## Related

- [Serverpod SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Dart best practices](../dart/best-practices.md)
