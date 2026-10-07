---
title: PHP instrumentation and tracing
description: Manual spans, incoming HTTP, PSR-15, Guzzle, PDO, mysqli, and Redis in talaria/talaria, with W3C traceparent.
sdk: php
package: talaria/talaria
tags: [php, instrumentation, tracing, spans, http, guzzle, pdo, redis]
---

# PHP instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). Successful transactions follow the traces sample rate. Error transactions are always sent. Spans use the OpenTelemetry span model. Outgoing Guzzle requests that go through `GuzzleMiddleware` set W3C `traceparent`.

Do not attach tracing middleware to Talaria's own ingest client.

## Manual spans

```php
use Talaria\Talaria;
use Talaria\Tracing\SpanStatus;

$span = Talaria::startSpan('checkout.charge');
try {
    charge();
    $span->setStatus(SpanStatus::Ok);
} catch (Throwable $e) {
    $span->setStatus(SpanStatus::Error, $e->getMessage());
    throw $e;
} finally {
    $span->end();
}
```

`startTransaction($name)` opens a SERVER root. `startSpan` defaults to INTERNAL. Pass `\Talaria\Tracing\SpanKind::Client` for an outbound call you time yourself. `setRecordQuerySpans(false)` pauses query spans. `withoutQuerySpans` pauses them for one callback. `getTraceparent()` returns the header value for the active span, or null when tracing is idle.

## Incoming HTTP

For a front controller that is not PSR-15:

```php
use Talaria\Tracing\IncomingHttp;

$transaction = IncomingHttp::startTransaction(Talaria::getClient());
// handle the request
$transaction->end();
```

The span name is the method and path. An inbound `traceparent` on the request is continued when the tracer is enabled.

## PSR-15

```php
$middleware = new \Talaria\Tracing\Psr15Middleware(Talaria::getClient());
$response = $middleware->process($request, $handler);
```

The middleware ends the SERVER span when `handle` returns.

## Guzzle

Push the middleware onto an application handler stack:

```php
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use Talaria\Tracing\GuzzleMiddleware;

$stack = HandlerStack::create();
$stack->push(GuzzleMiddleware::create(Talaria::getClient()));
$http = new Client(['handler' => $stack]);
```

Each request becomes a CLIENT span and a breadcrumb. Ingest paths are skipped. The request gets a `traceparent` header while the span is recording.

A Guzzle client that already uses this middleware records OpenAI and Anthropic the same way. `POST` to `api.openai.com` on `/v1/chat/completions`, `/v1/responses`, `/v1/completions`, or `/v1/embeddings`, and `POST` to `api.anthropic.com` on `/v1/messages`, become one client span named `{operation} {model}`. The attributes are the OpenTelemetry GenAI names for operation, provider, model, and token counts. A streaming response leaves the token counts unset. Prompt and completion text are not span attributes. The span is recorded only when a transaction is already open.

## PDO

`TracingPdo` wraps an existing connection. It does not extend PDO.

```php
$traced = new \Talaria\Tracing\TracingPdo($pdo, Talaria::getClient(), 'mysql');
$traced->query('SELECT id FROM users WHERE id = 1');
```

The third argument is `db.system.name` (`mysql`, `pgsql`, `sqlite`). `query`, `exec`, and `prepare` / `execute` record CLIENT spans. Call `$traced->inner()` when you need the raw PDO.

## mysqli

```php
\Talaria\Tracing\TracingMysqli::query($mysqli, Talaria::getClient(), $sql);
```

`TracingMysqli::execute` binds parameters and records the same kind of span.

## Redis

Predis and phpredis are not Composer requirements of this package. Wrap the instance you already have:

```php
$redis = new \Talaria\Tracing\RedisClientProxy($predis, Talaria::getClient());
$redis->get('session:42');
```

Commands become CLIENT spans named `redis GET` plus a query breadcrumb. `inner()` returns the original client.

## Related

- [PHP SDK](README.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Configuration](../../getting-started/configuration.md)
