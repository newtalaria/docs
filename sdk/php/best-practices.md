---
title: PHP best practices
description: Release, sampling, analytics, and feature flags for talaria/talaria.
sdk: php
package: talaria/talaria
tags: [php, analytics, feature-flags, sampling, release]
---

# PHP best practices

## Release

Set `release` from the deployed version or git SHA. Local runs should still send one. Release health in the dashboard groups on that string.

## API key and environment

The API key chooses the environment. Do not pass `environment` in `Talaria::init`. Load the key from the environment in both FPM and CLI. Restart PHP after rotating a rejected key (the failure is cached for about 24 hours).

## Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. A response with `retry: false` stops that signal until the process starts again.

## Project settings

Tracing, analytics, and feature flags follow [Project configuration](../../getting-started/configuration.md). The client clears those switches until `sdk/getConfig` returns. Session replay, heatmaps, and web vitals are recorded by `@newtalaria/browser` when [Laravel](../laravel/README.md) or [Silverstripe](../silverstripe/README.md) injects it.

## Analytics

Enable Analytics in Project settings.

```php
Talaria::analytics()->identify('user_42', ['plan' => 'pro']);
Talaria::analytics()->track('Invoice Sent', ['plan' => 'pro']);
Talaria::analytics()->page('Pricing');
```

`screen` is on the same client. The server has no cookie banner. Pass the user id you already have. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

```php
$on = Talaria::flags()->boolVariation('new-checkout', false);
```

`stringVariation` and `jsonVariation` take a key and a default. Evaluation uses the API key's environment. A disabled flag returns the default.

## Privacy in events

Do not put tokens or card numbers in breadcrumb `data` or capture `extra`. Query spans store SQL text. Keep bound values out of the statement string when you can.

## Verify

`search_errors` with the environment of the key this process used. Analytics counts on `get_project_stats` stay at 0 while analytics is off.

## Related

- [PHP SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
