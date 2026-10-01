---
title: Silverstripe SDK
description: Install talaria/silverstripe — Silverstripe CMS integration for Talaria.
sdk: silverstripe
package: talaria/silverstripe
tags: [silverstripe, php, install]
---

# Silverstripe SDK

## Prerequisites / supported versions

- Silverstripe version supported by `talaria/silverstripe` on Packagist

## Package name + install command

```bash
composer require talaria/silverstripe
```

## Initialization

Module config / env per package README. Env typically needs `TALARIA_API_KEY` (DSN defaults to Talaria Cloud) and `TALARIA_RELEASE` as a version or SHA. The API key decides the environment.

## App init vs Project settings

See [configuration](../../getting-started/configuration.md).

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials**. The key decides the environment. Each key is bound to development, test, staging, or production, and the prefix stays `tal_live_`. The server stamps that value on ingest. A deployed app that should report production uses a production key. Local install uses a development key. Pass the key via env / config.

## Optional features

Tracing via Project settings.

## Verification

Trigger an error; MCP `search_errors`.

## Troubleshooting

Flush Silverstripe cache/manifest after install.

## Related docs

- [PHP](../php/README.md)
- [Configuration](../../getting-started/configuration.md)
