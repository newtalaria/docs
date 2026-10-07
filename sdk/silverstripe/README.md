---
title: Silverstripe SDK
description: Quick setup for talaria/silverstripe — Composer, TALARIA_API_KEY, Monolog, and the first error. HTTP, MySQL, Guzzle, queued jobs, and the browser script.
sdk: silverstripe
package: talaria/silverstripe
tags: [silverstripe, php, install, init]
---

# Silverstripe SDK

`talaria/silverstripe` (2.0.1) is the Silverstripe 4.13, 5, and 6 module on PHP 8.1. Injector builds the client and pushes a Monolog handler onto the framework logger. Do not call `Talaria::init()` yourself.

## Quick setup

```bash
composer require talaria/silverstripe
```

```env
TALARIA_API_KEY=tal_live_…
TALARIA_RELEASE=1.4.2
```

The DSN defaults to `https://ingest.newtalaria.com`. Set `Talaria\SilverStripe\Config.dsn` in YAML only when the API is somewhere else. Flush the manifest after install (`vendor/bin/sake dev/build flush=1`, or your usual flush). Log an error or throw. Confirm with MCP `search_errors` and `environment: development`.

## What you can do

| Capability | Where |
| --- | --- |
| Monolog errors and logs, breadcrumbs, and the current Member | [Errors, logs, and breadcrumbs](errors.md) |
| HTTP middleware, MySQL, Guzzle, and queued jobs | [Instrumentation and tracing](instrumentation.md) |
| PHP analytics, feature flags, and the injected browser script | [Best practices](best-practices.md) |
| Move between module versions | [Upgrade](upgrade.md) |

CMS and public pages load `@newtalaria/browser`. Replay, heatmaps, web vitals, and consent run in that script. Public pages can send browser analytics. The CMS is not opted into analytics. There is no Redis wrapper. Silverstripe has no core Redis usage this module instruments. Use the [PHP Redis proxy](../php/instrumentation.md) if you added Redis yourself.

## Install

```bash
composer require talaria/silverstripe
```

## Initialization

YAML and environment are the setup. The module reads:

| Variable or YAML | Role |
| --- | --- |
| `TALARIA_API_KEY` | Ingest key. Chooses the environment |
| `TALARIA_RELEASE` | Version or SHA |
| `TALARIA_DSN` | Optional. Default `https://ingest.newtalaria.com` |
| `TALARIA_BROWSER_DSN` | Browser script only, when the PHP DSN is not reachable from the browser |
| `TALARIA_BROWSER_API_KEY` | Browser script only. PHP keeps `apiKey` |
| `enableBrowserCms` / `enableBrowserFrontend` | Default true |

`minLevel` defaults to `warning`.

## App init vs Project settings

Tracing, analytics, heatmaps, and replay follow [Project configuration](../../getting-started/configuration.md). The CMS admin is not opted into browser analytics. Public pages can send analytics through the injected script when the project allows it.

## API key

Use a development key locally and a production key on the live site. The prefix stays `tal_live_`. A non-empty `TALARIA_BROWSER_API_KEY` that is not a `tal_live_` key disables browser inject. Leave it unset to share the PHP key.

## Verification

Trigger a logged error. `search_errors` with `environment: development`. Flush caches so the new module config is loaded.

## Troubleshooting

A rejected key is cached for about 24 hours. Restart PHP-FPM after rotating it. If the browser script is missing, check `enableBrowserFrontend` and that the response is a normal HTML page.

## Related docs

- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Upgrade](upgrade.md)
- [PHP SDK](../php/README.md)
- [Configuration](../../getting-started/configuration.md)
