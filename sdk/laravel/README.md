---
title: Laravel SDK
description: >-
  Install the Talaria laravel SDK and capture errors, logs, and traces from your
  laravel application.
package: talaria/laravel
tags:
  - laravel
  - php
  - install
  - init
id: laravel
navTitle: Overview
type: quickstart
section: platforms
platform:
  - laravel
feature: []
order: 10
lastReviewed: '2026-10-30'
owner: docs
---

# Laravel SDK

## What you're setting up

`talaria/laravel` (3.0.0) is the Laravel 10, 11, and 12 adapter. The service provider is auto-discovered.

**What you can do**

| Capability | Where |
| --- | --- |
| Exceptions, the `talaria` log channel, breadcrumbs, and the authenticated user | [Errors, logs, and breadcrumbs](errors.md) |
| HTTP, database queries, queues, the HTTP client, and Artisan | [Instrumentation and tracing](tracing.md) |
| Analytics, feature flags, and the injected browser script (replay, heatmaps, web vitals, consent) | [Best practices](configuration.md) |

Octane, Horizon, and Livewire spans register when those packages are installed. Tracing and analytics follow [Project configuration](../../get-started/project-settings.md).

## Why use this

Do not call `Talaria::init()` yourself.

## Before you start

It requires PHP 8.1.

## Steps

### 1. Quick setup

```bash
composer require talaria/laravel:^3.0
```

```env
TALARIA_API_KEY=tal_sk_prod_nz1_…
TALARIA_BROWSER_API_KEY=tal_pk_prod_nz1_…
TALARIA_BROWSER_SDK_VERSION=0.6.0
TALARIA_RELEASE=1.4.2
```

`TALARIA_API_KEY` is the secret key the server uses. `TALARIA_BROWSER_API_KEY` is the publishable key for the injected browser script and must be a `tal_pk_` key. The secret key is never injected into the page; without a valid `tal_pk_` key the script is skipped. Pin `TALARIA_BROWSER_SDK_VERSION` to `0.6.0`, the browser SDK that matches these keys. Leave `TALARIA_URL` unset so the SDK derives `https://ingest-<cell>.newtalaria.com` from the key. Publish the config if you need to change it:

```bash
php artisan vendor:publish --tag=talaria-config
```

Throw in a route. The exception handler's `reportable` hook calls `captureException`. Confirm with MCP `search_issues` and `environment: development`. Run `php artisan config:clear` after changing `.env`.

### 2. Install

```bash
composer require talaria/laravel:^3.0
```

### 3. Initialization

The provider builds the client from `config/talaria.php`. You configure the app with environment variables:

| Variable | Role |
| --- | --- |
| `TALARIA_API_KEY` | Secret `tal_sk_` key. Chooses the environment. Never injected into the page |
| `TALARIA_BROWSER_API_KEY` | Publishable `tal_pk_` key for the injected browser script (config `browser_api_key`) |
| `TALARIA_BROWSER_SDK_VERSION` | `@newtalaria/browser` version loaded from jsDelivr. Set `0.6.0` |
| `TALARIA_URL` | Optional. Self-host or a custom domain only. Otherwise the SDK derives the host from the key |
| `TALARIA_RELEASE` | Version or SHA |
| `TALARIA_COMMIT_SHA` | Commit on events |
| `TALARIA_SERVICE` | `service` tag. Defaults to `APP_NAME` |
| `TALARIA_MIN_LEVEL` | Default `warning` |
| `TALARIA_BROWSER` | Inject `@newtalaria/browser` on the `web` group. Default true |

### 4. App init vs Project settings

Leave tracing, analytics, and replay to Project settings. The adapter still sends the key and release from config. `TALARIA_ENABLE_TRACING` in the published file is not the switch the running client uses after fetching project configuration.

### 5. API key

Laravel takes two keys. `TALARIA_API_KEY` is a secret `tal_sk_<env>_<cell>_…` key for the server; a malformed key fails fast and an empty key leaves the client disabled. `TALARIA_BROWSER_API_KEY` is a publishable `tal_pk_<env>_<cell>_…` key for the browser. `<env>` is `prod`, `stg`, `test`, or `dev`. Use development keys locally and production keys in production. Do not commit the key. Send `TALARIA_RELEASE` on every environment, including local.

## Check it worked

Hit a route that throws. `search_issues` with `environment: development`. The dashboard shell defaults to production when a production key exists, so switch it to Development for this install.

## Troubleshooting

`php artisan config:clear` after env edits. Restart Octane after a key change. A rejected key is cached for about 24 hours.

## Next steps

- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [PHP SDK](../php/README.md)
- [Configuration](../../get-started/project-settings.md)
