---
title: PHP
description: Install talaria/talaria 3.0.3 and initialise with a secret key.
section: sdk
order: 90
---

`talaria/talaria` **3.0.3** is the official PHP SDK. PHP **8.1+**. Building Silverstripe? Install [`talaria/silverstripe`](/sdk/silverstripe/). Building Laravel? Install [`talaria/laravel`](/sdk/laravel/).

## Install

```bash
composer require talaria/talaria:^3.0
```

## Initialise

```php
use Talaria\Talaria;

Talaria::init([
    'apiKey' => getenv('TALARIA_API_KEY'),
    'release' => getenv('TALARIA_RELEASE') ?: null,
    'minLevel' => 'warning',
]);
```

`TALARIA_API_KEY` is a secret `tal_sk_<env>_<cell>_…` key. A missing or bad key never throws: Talaria is disabled, every call is a no-op, and one warning is logged (at most the first eight key characters). A publishable `tal_pk_` key logs one warning: ingest and `POST /v1/flags/evaluate` work, but monitors, releases, and `GET /v1/flags` need a secret key.

Leave `url` unset and the SDK sends to `https://ingest-<cell>.newtalaria.com` from the key.

## Verify

```php
\Talaria\Talaria::captureException(new \RuntimeException('Talaria test error'));
```

Run this once, then open **Issues** in the [dashboard](https://one.newtalaria.com). The test error shows as a new issue in the key's environment. Nothing there? See [fail-safe](/get-started/fail-safe/).

## Next

See [configuration](/sdk/php/configuration/), [errors](/sdk/php/errors/), and [tracing](/sdk/php/tracing/). For container logs on SiteHost, also follow the [SiteHost guide](/guides/collectors/sitehost/).
