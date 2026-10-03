---
title: Laravel best practices
description: Release, sampling, analytics, feature flags, and the injected browser session replay, heatmaps, and consent for talaria/laravel.
sdk: laravel
package: talaria/laravel
tags: [laravel, analytics, feature-flags, replay, heatmaps, consent, sampling, release]
---

# Laravel best practices

## Release

Set `TALARIA_RELEASE` to the version or git SHA of this deploy. Local `.env` should still set one. Browser source maps, if you ship a separate frontend, must use that same string. The injected script uses the release from this config.

## API key and environment

`TALARIA_API_KEY` chooses the environment. Do not add an environment field. Use a development key locally and a production key in production `.env`. Run `php artisan config:clear` after a change, and restart Octane workers.

`TALARIA_BROWSER_API_KEY` and `TALARIA_BROWSER_DSN` override the key and DSN for the injected script only. Leave them empty to share the PHP key. Use them when the browser cannot reach the PHP DSN (a Docker-internal host, for example).

## Sampling

Successful traces follow the project traces sample rate. Error traces stay. A response with `retry: false` stops that signal until the PHP process restarts. Octane is one long process, so a kill switch lasts until the worker restarts.

## Project settings

Tracing, analytics, heatmaps, and session replay follow [Project configuration](../../getting-started/configuration.md).

## Analytics

Enable Analytics in Project settings. PHP:

```php
Talaria::analytics()->identify((string) auth()->id(), ['plan' => 'pro']);
Talaria::analytics()->track('Checkout Started', ['plan' => 'pro']);
```

There is no Laravel facade for analytics. `Talaria::analytics()` is the core client. HTML pages also get `@newtalaria/browser`, which can send `page` and `track` from the browser after consent. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

Flags are the core client. There is no Laravel facade or config surface.

```php
$on = Talaria::flags()->boolVariation('new-checkout', false);
```

## Session replay

The `web` middleware group injects `@newtalaria/browser` from jsDelivr (`TALARIA_BROWSER_SDK_VERSION`, default `0.5.3`). Replay starts when session replay is enabled in Project settings and the visitor consent state allows it. Set `TALARIA_BROWSER=false` to skip the script.

## Heatmaps

Heatmaps are recorded by that same browser script when analytics and heatmaps are enabled and the visitor has consented.

## Web Vitals

LCP, INP, CLS, and TTFB are recorded in the injected browser script as child spans of the pageload, when tracing is on.

## Consent

The injected script follows CookieYes, Cookiebot, and Google Consent Mode. Any other banner should call `analytics.optIn()` in the page after agreement. See [Cookie banners](../../analytics/consent.md). PHP `Talaria::analytics()` does not wait for a banner. Call it only for server-side events you already have a lawful basis to send.

## Privacy in events

Query spans include SQL text. Do not concatenate secrets into queries. Do not log raw request bodies on the `talaria` channel.

## Related

- [Laravel SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Browser best practices](../javascript/best-practices.md)
