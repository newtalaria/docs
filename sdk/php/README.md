---
title: PHP SDK
description: Quick setup for talaria/talaria — install, init, and capture the first exception. Tracing, PSR-3 logs, analytics, and feature flags.
sdk: php
package: talaria/talaria
tags: [php, install, init]
---

# PHP SDK

`talaria/talaria` (2.0.0) is the framework-agnostic PHP client. Laravel and Silverstripe apps should use those adapters instead of calling `Talaria::init` themselves.

## Quick setup

```bash
composer require talaria/talaria
```

```php
<?php

use Talaria\Talaria;

Talaria::init([
    'dsn' => 'https://ingest.newtalaria.com',
    'apiKey' => getenv('TALARIA_API_KEY'),
    'release' => getenv('TALARIA_RELEASE') ?: 'dev',
    'minLevel' => 'warning',
]);

try {
    throw new RuntimeException('talaria hello');
} catch (Throwable $e) {
    Talaria::captureException($e);
}

Talaria::flush();
```

The key decides the environment. Do not pass `environment`. Confirm with MCP `search_errors` and `environment: development`. `flush()` matters in a short-lived CLI process. A web SAPI flushes on shutdown.

## What you can do

| Capability | Where |
| --- | --- |
| Exceptions, PSR-3 logs, breadcrumbs, user, and tags | [Errors, logs, and breadcrumbs](errors.md) |
| Incoming HTTP, PSR-15, Guzzle, PDO, mysqli, and Redis | [Instrumentation and tracing](instrumentation.md) |
| Analytics and feature flags | [Best practices](best-practices.md) |

Tracing and analytics follow [Project configuration](../../getting-started/configuration.md). Framework wiring lives in [Laravel](../laravel/README.md) and [Silverstripe](../silverstripe/README.md).

## Install

PHP 8.1 or newer.

```bash
composer require talaria/talaria
```

## Initialization

```php
Talaria::init([
    'dsn' => 'https://ingest.newtalaria.com',
    'apiKey' => getenv('TALARIA_API_KEY'),
    'release' => getenv('TALARIA_RELEASE') ?: null,
    'commitSha' => getenv('TALARIA_COMMIT_SHA') ?: null,
    'minLevel' => 'warning',
    'tags' => ['service' => 'api'],
]);
```

A second `init` is ignored. Uncaught errors are captured while default integrations are on (the default). Pass `'defaultIntegrations' => false` when an adapter installs its own handler.

## App init vs Project settings

Init holds the DSN, API key, release, minimum level, and tags. Tracing, analytics, and feature flags turn on from Project settings after `sdk/getConfig`. Init values for those switches are not what the process uses. Set `'remoteConfig' => false` only when this process should send errors and skip that fetch.

## API key

`TALARIA_API_KEY` is a `tal_live_…` key. It is safe to load from the environment. The server stamps the key's environment on ingest. Use a development key locally and a production key on the deployed app. Send `release` as a version or SHA, including for local runs.

## Verification

`Talaria::captureException($e)` then `Talaria::flush()`. MCP `search_errors` with `environment: development`.

## Troubleshooting

Confirm the env vars are loaded in the SAPI you are running (FPM and CLI do not share a shell). A rejected key is cached for about 24 hours. Restart PHP after rotating it. Spans stay empty until tracing is on in Project settings.

## Related docs

- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Laravel](../laravel/README.md)
- [Silverstripe](../silverstripe/README.md)
- [Configuration](../../getting-started/configuration.md)
