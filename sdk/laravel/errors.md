---
title: Laravel errors, logs, and breadcrumbs
description: reportable captureException, the talaria log channel, breadcrumbs, and the authenticated user on talaria/laravel.
sdk: laravel
package: talaria/laravel
tags: [laravel, errors, logs, breadcrumbs, identity]
---

# Laravel errors, logs, and breadcrumbs

## Errors

The provider registers a `reportable` callback that calls `captureException`. You do not replace the exception handler. A thrown exception in a route, job, or command is an event.

For a handled failure:

```php
use Talaria\Talaria;

try {
    charge();
} catch (Throwable $e) {
    Talaria::captureException($e, [
        'tags' => ['area' => 'billing'],
    ]);
    throw $e;
}
```

## Logs

Add a `talaria` channel. The driver name is `talaria`.

```php
'channels' => [
    'talaria' => [
        'driver' => 'talaria',
        'level' => 'warning',
    ],
],
```

```php
Log::channel('talaria')->warning('Payment method missing');
```

Put `talaria` on the `stack` channel if every log line should also be an event. The channel is a PSR-3 `Talaria\Logger`. Levels below `TALARIA_MIN_LEVEL` (default `warning`) are dropped unless that logger sets its own level and the client is not enforcing the default.

## Breadcrumbs

`Talaria::addBreadcrumb` is the core API. HTTP and query integrations add their own crumbs and attach the trail to the next error.

```php
Talaria::addBreadcrumb([
    'type' => 'default',
    'category' => 'billing',
    'message' => 'Charge started',
    'level' => 'info',
]);
```

## Identity and context

When `TALARIA_IDENTIFY_USERS` is true (the default), the authenticated user id is stamped on events. Release and commit come from `TALARIA_RELEASE` and `TALARIA_COMMIT_SHA`. The same values are written into the injected browser init.

Fingerprints are computed on the server. Call `Talaria::flush()` at the end of a one-off Artisan command if you exit before the process shuts down cleanly. Queues already flush after each job.

## Related

- [Laravel SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
- [PHP errors](../php/errors.md)
