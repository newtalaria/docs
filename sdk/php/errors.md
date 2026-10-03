---
title: PHP errors, logs, and breadcrumbs
description: captureException, PSR-3 Talaria\Logger, breadcrumbs, and user context on talaria/talaria.
sdk: php
package: talaria/talaria
tags: [php, errors, logs, breadcrumbs, identity]
---

# PHP errors, logs, and breadcrumbs

## Errors

Uncaught throwables are captured when default integrations are on. Catch recoverable work yourself:

```php
try {
    charge();
} catch (Throwable $e) {
    Talaria::captureException($e, [
        'tags' => ['area' => 'billing'],
    ]);
    throw $e;
}
```

```php
Talaria::captureMessage('Checkout failed closed', 'error');
```

`minLevel` of `warning` drops info and debug messages. Exceptions are errors, so they still pass.

## Logs

`Talaria\Logger` implements PSR-3. Severity methods on the facade send the same stream.

```php
$log = Talaria::logger([
    'name' => 'billing',
    'tags' => ['area' => 'billing'],
]);
$log->warning('Payment method missing');

Talaria::error('Charge declined');
```

Levels are `debug`, `info`, `warning`, `error`, and `fatal`. `warn` is `warning`. A scoped logger may use a lower `minLevel` than the client unless `enforceDefaultLevel` is true.

## Breadcrumbs

```php
Talaria::addBreadcrumb([
    'type' => 'default',
    'category' => 'billing',
    'message' => 'Charge started',
    'level' => 'info',
]);
```

Guzzle, PDO, and Redis helpers add their own crumbs. The trail is attached to the next error (up to 50).

## Identity and context

`setUser` and `setTags` live on the client. Prefer a processor when the PHP process is long-lived and the user changes every request. `resetRequestState()` clears request scope between requests.

```php
$client = Talaria::getClient();
$client->setUser('user_42');
$client->setTags(['area' => 'billing']);
```

Set `release` and `commitSha` in init. Fingerprints are computed on the server.

Call `Talaria::flush()` before a CLI script exits.

## Related

- [PHP SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Best practices](best-practices.md)
