---
title: Silverstripe configuration
description: >-
  Release, sampling, analytics, feature flags, and injected browser replay,
  heatmaps, and consent for talaria/silverstripe.
package: talaria/silverstripe
tags:
  - silverstripe
  - analytics
  - feature-flags
  - replay
  - heatmaps
  - consent
  - sampling
  - release
id: silverstripe-configuration
navTitle: Configuration
type: guide
section: platforms
platform:
  - silverstripe
feature:
  - analytics
  - feature-flags
order: 50
lastReviewed: '2026-10-29'
owner: docs
---
# Silverstripe configuration

## What you're setting up

Release, sampling, analytics, feature flags, and injected browser replay, heatmaps, and consent for talaria/silverstripe.

## Steps

### 1. Release

Set `TALARIA_RELEASE` to the version or commit of this deploy. The PHP client and the injected browser init both send it. A local site should still set one.

### 2. API key and environment

`TALARIA_API_KEY` is a secret key and chooses the environment. Use a development key on a laptop and a production key on the live server. `browser_api_key` / `TALARIA_BROWSER_API_KEY` is the publishable key for the browser script. A value that is not a `tal_pk_` key turns browser inject off. Set `TALARIA_URL` only when the API is self-hosted or on a custom domain.

### 3. Sampling

Successful traces follow the project traces sample rate. Error traces stay. A response with `retry: false` stops that signal until PHP restarts.

### 4. Project settings

Tracing, analytics, heatmaps, and session replay follow [Project configuration](../../get-started/project-settings.md). Turn analytics on there for PHP `Talaria::analytics()` and for the public-site browser script. The CMS admin is not opted into browser analytics.

### 5. Analytics

```php
Talaria::analytics()->track('Enquiry Sent', ['form' => 'contact']);
```

On public pages the injected script can send `page` and `track` after consent. See [Product analytics setup](../../features/analytics.md).

### 6. Feature flags

```php
$on = Talaria::flags()->boolVariation('new-checkout', false);
```

`Talaria::flags()` is the core client. There is no separate Silverstripe flag API.

### 7. Session replay

CMS and public HTML pages load `@newtalaria/browser`. Replay runs when session replay is enabled in Project settings and visitor consent allows it. CMS pages set inline stylesheets so the player can show admin CSS that required a login. Set `enableBrowserCms` or `enableBrowserFrontend` to false to skip a surface.

### 8. Heatmaps

The injected script records clicks, scroll depth, and snapshots when analytics and heatmaps are enabled and the visitor has consented.

### 9. Web Vitals

LCP, INP, CLS, and TTFB are child spans of the browser pageload when tracing is on.

### 10. Consent

The browser script follows CookieYes, Cookiebot, and Google Consent Mode. Any other banner calls `analytics.optIn()` on the page. See [Cookie banners](../../guides/cookie-banners.md). PHP analytics does not read that banner.

### 11. Privacy in events

Do not log passwords or card data through the framework logger. Query spans include SQL text. Member id is stored as `userId` when someone is logged in.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [Silverstripe SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Browser best practices](../javascript/configuration.md)
