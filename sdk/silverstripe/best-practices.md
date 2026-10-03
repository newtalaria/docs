---
title: Silverstripe best practices
description: Release, sampling, analytics, feature flags, and injected browser replay, heatmaps, and consent for talaria/silverstripe.
sdk: silverstripe
package: talaria/silverstripe
tags: [silverstripe, analytics, feature-flags, replay, heatmaps, consent, sampling, release]
---

# Silverstripe best practices

## Release

Set `TALARIA_RELEASE` to the version or commit of this deploy. The PHP client and the injected browser init both send it. A local site should still set one.

## API key and environment

`TALARIA_API_KEY` chooses the environment. Use a development key on a laptop and a production key on the live server. `TALARIA_BROWSER_API_KEY` is optional and applies only to the browser script. A value that is not a `tal_live_` key turns browser inject off. `TALARIA_BROWSER_DSN` is for the case where the browser cannot reach the PHP DSN.

## Sampling

Successful traces follow the project traces sample rate. Error traces stay. A response with `retry: false` stops that signal until PHP restarts.

## Project settings

Tracing, analytics, heatmaps, and session replay follow [Project configuration](../../getting-started/configuration.md). Turn analytics on there for PHP `Talaria::analytics()` and for the public-site browser script. The CMS admin is not opted into browser analytics.

## Analytics

```php
Talaria::analytics()->track('Enquiry Sent', ['form' => 'contact']);
```

On public pages the injected script can send `page` and `track` after consent. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

```php
$on = Talaria::flags()->boolVariation('new-checkout', false);
```

`Talaria::flags()` is the core client. There is no separate Silverstripe flag API.

## Session replay

CMS and public HTML pages load `@newtalaria/browser`. Replay runs when session replay is enabled in Project settings and visitor consent allows it. CMS pages set inline stylesheets so the player can show admin CSS that required a login. Set `enableBrowserCms` or `enableBrowserFrontend` to false to skip a surface.

## Heatmaps

The injected script records clicks, scroll depth, and snapshots when analytics and heatmaps are enabled and the visitor has consented.

## Web Vitals

LCP, INP, CLS, and TTFB are child spans of the browser pageload when tracing is on.

## Consent

The browser script follows CookieYes, Cookiebot, and Google Consent Mode. Any other banner calls `analytics.optIn()` on the page. See [Cookie banners](../../analytics/consent.md). PHP analytics does not read that banner.

## Privacy in events

Do not log passwords or card data through the framework logger. Query spans include SQL text. Member id is stored as `userId` when someone is logged in.

## Related

- [Silverstripe SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Browser best practices](../javascript/best-practices.md)
