---
title: Silverstripe SDK
description: >-
  Install the Talaria silverstripe SDK and capture errors, logs, and traces from
  your silverstripe application.
package: talaria/silverstripe
tags:
  - silverstripe
  - php
  - install
  - init
id: silverstripe
navTitle: Overview
type: quickstart
section: platforms
platform:
  - silverstripe
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# Silverstripe SDK

`talaria/silverstripe` (2.0.1) is the Silverstripe 4.13, 5, and 6 module on PHP 8.1. Injector builds the client and pushes a Monolog handler onto the framework logger. Do not call `Talaria::init()` yourself.

## Quick setup

```bash
composer require talaria/silverstripe
```

```env
TALARIA_API_KEY=tal_sk_prod_nz1_…
TALARIA_RELEASE=1.4.2
```

Leave `url` and `TALARIA_URL` unset on Talaria Cloud. The SDK derives `https://ingest-nz1.newtalaria.com` from the key. Set `Talaria\SilverStripe\Config.url` in YAML only for self-host or a custom domain. Flush the manifest after install (`vendor/bin/sake dev/build flush=1`, or your usual flush). Log an error or throw. Confirm with MCP `search_issues` and `environment: development`.

## What you can do

| Capability | Where |
| --- | --- |
| Monolog errors and logs, breadcrumbs, and the current Member | [Errors, logs, and breadcrumbs](errors.md) |
| HTTP middleware, MySQL, Guzzle, and queued jobs | [Instrumentation and tracing](tracing.md) |
| PHP analytics, feature flags, and the injected browser script | [Best practices](configuration.md) |
| Move between module versions | [Upgrade](upgrade.md) |

CMS and public pages load `@newtalaria/browser`. Replay, heatmaps, web vitals, and consent run in that script. Public pages can send browser analytics. The CMS is not opted into analytics. There is no Redis wrapper. Silverstripe has no core Redis usage this module instruments. Use the [PHP Redis proxy](../php/tracing.md) if you added Redis yourself.

## Install

```bash
composer require talaria/silverstripe
```

## Initialization

YAML and environment are the setup. The module reads:

| Variable or YAML | Role |
| --- | --- |
| `TALARIA_API_KEY` | Secret key. Chooses the environment |
| `TALARIA_RELEASE` | Version or SHA |
| `TALARIA_URL` | Optional. Self-host or a custom domain only. Otherwise the SDK derives the host from the key |
| `browser_api_key` / `TALARIA_BROWSER_API_KEY` | Publishable key for the browser script. PHP keeps `apiKey` |
| `enableBrowserCms` / `enableBrowserFrontend` | Default true |

`minLevel` defaults to `warning`.

## App init vs Project settings

Tracing, analytics, heatmaps, and replay follow [Project configuration](../../get-started/project-settings.md). The CMS admin is not opted into browser analytics. Public pages can send analytics through the injected script when the project allows it.

## API key

Use a development secret key locally and a production secret key on the live site. Publishable keys look like `tal_pk_<env>_nz1_…` and secret keys look like `tal_sk_<env>_nz1_…`. Set `browser_api_key` to a `tal_pk_` key for the injected script. A browser value that is not a `tal_pk_` key disables browser inject.

## Verification

Trigger a logged error. `search_issues` with `environment: development`. Flush caches so the new module config is loaded.

## Troubleshooting

A rejected key is cached for about 24 hours. Restart PHP-FPM after rotating it. If the browser script is missing, check `enableBrowserFrontend` and that the response is a normal HTML page.

## Related docs

- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [Upgrade](upgrade.md)
- [PHP SDK](../php/README.md)
- [Configuration](../../get-started/project-settings.md)
