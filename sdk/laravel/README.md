---
title: Laravel SDK
description: Quick setup for talaria/laravel — Composer, TALARIA_API_KEY, and the first exception. HTTP, database, queues, and the browser script.
sdk: laravel
package: talaria/laravel
tags: [laravel, php, install, init]
---

# Laravel SDK

`talaria/laravel` (2.0.1) is the Laravel 10, 11, and 12 adapter. It requires PHP 8.1. The service provider is auto-discovered. Do not call `Talaria::init()` yourself.

## Quick setup

```bash
composer require talaria/laravel
```

```env
TALARIA_API_KEY=tal_live_…
TALARIA_RELEASE=1.4.2
```

The published config defaults the DSN to `https://ingest.newtalaria.com`. Publish it if you need to change that:

```bash
php artisan vendor:publish --tag=talaria-config
```

Throw in a route. The exception handler's `reportable` hook calls `captureException`. Confirm with MCP `search_errors` and `environment: development`. Run `php artisan config:clear` after changing `.env`.

## What you can do

| Capability | Where |
| --- | --- |
| Exceptions, the `talaria` log channel, breadcrumbs, and the authenticated user | [Errors, logs, and breadcrumbs](errors.md) |
| HTTP, database queries, queues, the HTTP client, and Artisan | [Instrumentation and tracing](instrumentation.md) |
| Analytics, feature flags, and the injected browser script (replay, heatmaps, web vitals, consent) | [Best practices](best-practices.md) |

Octane, Horizon, and Livewire spans register when those packages are installed. Tracing and analytics follow [Project configuration](../../getting-started/configuration.md).

## Install

```bash
composer require talaria/laravel
```

## Initialization

The provider builds the client from `config/talaria.php`. You configure the app with environment variables:

| Variable | Role |
| --- | --- |
| `TALARIA_API_KEY` | Ingest key. Chooses the environment |
| `TALARIA_DSN` | Defaults to `https://ingest.newtalaria.com` |
| `TALARIA_RELEASE` | Version or SHA |
| `TALARIA_COMMIT_SHA` | Commit on events |
| `TALARIA_SERVICE` | `service` tag. Defaults to `APP_NAME` |
| `TALARIA_MIN_LEVEL` | Default `warning` |
| `TALARIA_BROWSER` | Inject `@newtalaria/browser` on the `web` group. Default true |

## App init vs Project settings

Leave tracing, analytics, and replay to Project settings. The adapter still sends the key and release from config. `TALARIA_ENABLE_TRACING` in the published file is not the switch the running client uses after `sdk/getConfig`.

## API key

A development key is what local install should use. Production uses a production key. The prefix stays `tal_live_`. Do not commit the key. Send `TALARIA_RELEASE` on every environment, including local.

## Verification

Hit a route that throws. `search_errors` with `environment: development`. The dashboard shell defaults to production when a production key exists, so switch it to Development for this install.

## Troubleshooting

`php artisan config:clear` after env edits. Restart Octane after a key change. A rejected key is cached for about 24 hours.

## Related docs

- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [PHP SDK](../php/README.md)
- [Configuration](../../getting-started/configuration.md)
