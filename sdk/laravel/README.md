---
title: Laravel SDK
description: Install talaria/laravel — Laravel integration for Talaria ingest.
sdk: laravel
package: talaria/laravel
tags: [laravel, php, install]
---

# Laravel SDK

## Prerequisites / supported versions

- Laravel version supported by `talaria/laravel` on Packagist

## Package name + install command

```bash
composer require talaria/laravel
```

## Initialization

Publish/config per package README. Env typically only needs `TALARIA_API_KEY` (DSN defaults to Talaria Cloud) and `TALARIA_RELEASE` as a version or SHA. The API key decides the environment.

## App init vs Project settings

See [configuration](../../getting-started/configuration.md).

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials**. The key decides the environment. Each key is bound to development, test, staging, or production, and the prefix stays `tal_live_`. The server stamps that value on ingest. A deployed app that should report production uses a production key. Local install uses a development key. Pass the key via `.env` as `TALARIA_API_KEY`.

## Optional features

Tracing/analytics via Project settings.

## Verification

Trigger an exception in a route; MCP `search_errors`.

## Troubleshooting

Clear config cache after env changes (`php artisan config:clear`).

## Related docs

- [PHP](../php/README.md)
- [Configuration](../../getting-started/configuration.md)
