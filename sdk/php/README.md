---
title: PHP SDK
description: Install talaria/talaria — initialize with a project API key and capture exceptions.
sdk: php
package: talaria/talaria
tags: [php, install]
---

# PHP SDK

## Prerequisites / supported versions

- PHP version required by `talaria/talaria` on Packagist

## Package name + install command

```bash
composer require talaria/talaria
```

## Initialization

```php
use Talaria\Talaria;

Talaria::init([
    'dsn' => 'https://ingest.newtalaria.com',
    'apiKey' => getenv('TALARIA_API_KEY'),
    'environment' => getenv('TALARIA_ENVIRONMENT') ?: 'production',
    'release' => getenv('TALARIA_RELEASE') ?: null,
    'minLevel' => 'warning',
]);
```

## App init vs Project settings

Init: DSN, API key, environment, release. Tracing via Project settings / `getConfig`. Set `remoteConfig => false` for errors-only without remote policy.

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials**. Pass them via environment variables when convenient.

## Optional features

Enable tracing in Project settings. Framework adapters: [Laravel](../laravel/README.md), [Silverstripe](../silverstripe/README.md).

## Verification

`Talaria::captureException($e)`; MCP `search_errors`.

## Troubleshooting

Confirm env vars are loaded in the SAPI you run (FPM vs CLI).

## Related docs

- [Configuration](../../getting-started/configuration.md)
- [Laravel](../laravel/README.md)
- [Silverstripe](../silverstripe/README.md)
