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

Publish/config per package README. Env typically only needs `TALARIA_API_KEY` (DSN defaults to Talaria Cloud).

## App init vs Project settings

See [configuration](../../getting-started/configuration.md).

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials**. Pass them via `.env` as `TALARIA_API_KEY` when convenient.

## Optional features

Tracing/analytics via Project settings.

## Verification

Trigger an exception in a route; MCP `search_errors`.

## Troubleshooting

Clear config cache after env changes (`php artisan config:clear`).

## Related docs

- [PHP](../php/README.md)
- [Configuration](../../getting-started/configuration.md)
