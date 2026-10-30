---
title: PHP configuration
description: 'Release, sampling, analytics, and feature flags for talaria/talaria.'
package: talaria/talaria
tags:
  - php
  - analytics
  - feature-flags
  - sampling
  - release
id: php-configuration
navTitle: Configuration
type: guide
section: platforms
platform:
  - php
feature:
  - analytics
  - feature-flags
order: 50
lastReviewed: '2026-10-29'
owner: docs
---
# PHP configuration

## What you're setting up

Release, sampling, analytics, and feature flags for talaria/talaria.

## Steps

### 1. Release

Set `release` from the deployed version or git SHA. Local runs should still send one. Release health in the dashboard groups on that string.

### 2. API key and environment

The API key chooses the environment. Do not pass `environment` in `Talaria::init`. Load the key from the environment in both FPM and CLI. Restart PHP after rotating a rejected key (the failure is cached for about 24 hours).

### 3. Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. A response with `retry: false` stops that signal until the process starts again.

### 4. Project settings

Tracing, analytics, and feature flags follow [Project configuration](../../get-started/project-settings.md). The client clears those switches until the SDK fetches and applies project configuration. Session replay, heatmaps, and web vitals are recorded by `@newtalaria/browser` when [Laravel](../laravel/README.md) or [Silverstripe](../silverstripe/README.md) injects it.

### 5. Analytics

Enable Analytics in Project settings.

```php
Talaria::analytics()->identify('user_42', ['plan' => 'pro']);
Talaria::analytics()->track('Invoice Sent', ['plan' => 'pro']);
Talaria::analytics()->page('Pricing');
```

`screen` is on the same client. The server has no cookie banner. Pass the user id you already have. See [Product analytics setup](../../features/analytics.md).

### 6. Feature flags

```php
$on = Talaria::flags()->boolVariation('new-checkout', false);
```

`stringVariation` and `jsonVariation` take a key and a default. Evaluation uses the API key's environment. A disabled flag returns the default.

### 7. Privacy in events

Do not put tokens or card numbers in breadcrumb `data` or capture `extra`. Query spans store SQL text. Keep bound values out of the statement string when you can.

## Check it worked

`search_issues` with the environment of the key this process used. Analytics counts on `get_project_stats` stay at 0 while analytics is off.

## Next steps

- [PHP SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
