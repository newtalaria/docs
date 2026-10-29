---
title: 'Silverstripe errors, logs, and breadcrumbs'
description: >-
  Capture exceptions, logs, breadcrumbs, and user context in silverstripe with
  Talaria.
package: talaria/silverstripe
tags:
  - silverstripe
  - errors
  - logs
  - breadcrumbs
  - identity
id: silverstripe-errors
navTitle: Errors and logs
type: guide
section: platforms
platform:
  - silverstripe
feature:
  - issues
  - logs
order: 20
lastReviewed: '2026-10-29'
owner: docs
---
# Silverstripe errors, logs, and breadcrumbs

## What you're setting up

Capture exceptions, logs, breadcrumbs, and user context in silverstripe with Talaria.

## Steps

### 1. Errors

The framework logger receives a Talaria Monolog handler (Monolog 3 on Silverstripe 5 and 6, Monolog 1/2 on Silverstripe 4). An error logged through `Injector::inst()->get(LoggerInterface::class)` is captured. Uncaught exceptions that Silverstripe logs take the same path.

Handled failures can call the core API:

```php
use Talaria\Talaria;

try {
    $this->charge();
} catch (Throwable $e) {
    Talaria::captureException($e, [
        'tags' => ['area' => 'billing'],
    ]);
    throw $e;
}
```

### 2. Logs

Anything you log at warning or above is sent. `minLevel` defaults to `warning`.

```php
use Psr\Log\LoggerInterface;
use SilverStripe\Core\Injector\Injector;

Injector::inst()->get(LoggerInterface::class)
    ->warning('Payment method missing');
```

Named presets live under `Talaria\SilverStripe\Config.loggers` in YAML. `Talaria::logger('businessDirectory')` uses that preset's level and tags.

### 3. Breadcrumbs

Core `Talaria::addBreadcrumb` works. HTTP requests and queued jobs add their own crumbs and attach the trail to the next error.

```php
Talaria::addBreadcrumb([
    'type' => 'default',
    'category' => 'checkout',
    'message' => 'Charge started',
    'level' => 'info',
]);
```

### 4. Identity and context

The logged-in Member id is `userId` on PHP events and on the injected browser init. Per-request tags include `ajax`, `ss_env`, and `host`. The process also sends `platform=php` and `runtime=silverstripe`. Set `release` with `TALARIA_RELEASE`. Optional YAML `service` and `tags` merge into init tags.

Fingerprints are computed on the server.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [Silverstripe SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Best practices](configuration.md)
- [PHP errors](../php/errors.md)
