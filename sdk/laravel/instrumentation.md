---
title: Laravel instrumentation and tracing
description: Automatic HTTP, QueryExecuted, queues, HTTP client, and Artisan spans in talaria/laravel, plus Octane, Horizon, and Livewire.
sdk: laravel
package: talaria/laravel
tags: [laravel, instrumentation, tracing, spans, http, queues, database]
---

# Laravel instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). The provider registers the integrations at boot. They no-op until the project document enables tracing. Successful transactions follow the traces sample rate. Error transactions are always sent.

Spans use the OpenTelemetry span model. HTTP middleware and the HTTP client continue W3C `traceparent`.

## HTTP

`TracingMiddleware` is pushed onto the kernel. Each request opens a SERVER span. The route name or URI template is `http.route`. An inbound `traceparent` becomes the parent.

## Database

`QueryExecuted` listeners record CLIENT spans. Identical SQL under one parent rolls into one span with `db.query.count`. Queries of 200ms or more, and failed queries, stay their own spans. The repeat count is how an N+1 shows up on that rolled span.

The slow-query threshold from Project settings still marks a slow query. Query text is stored on the span. Use bindings so values are not concatenated into the SQL string.

## Queues

Each job runs as a CONSUMER transaction. The adapter calls `flush()` and `resetRequestState()` after the job so the next job does not inherit the previous scope.

## HTTP client

Laravel's HTTP client (`Http::` / Guzzle under the hood) gets CLIENT spans and `traceparent` on outgoing requests. Talaria's own ingest client is not wrapped.

## Artisan

Console commands open a span for the command when tracing is on.

## Octane, Horizon, and Livewire

These register only when the package is installed. They are not Composer requirements.

- Octane resets request state on receive and flushes on terminate.
- Horizon records its worker spans when Horizon is present.
- Livewire records child spans only when a SERVER transaction is already open.

## Manual spans

The PHP client is available when you need a span the integrations do not open:

```php
use Talaria\Talaria;
use Talaria\Tracing\SpanStatus;

$span = Talaria::startSpan('checkout.charge');
try {
    charge();
    $span->setStatus(SpanStatus::Ok);
} finally {
    $span->end();
}
```

## Browser script

HTML responses on the `web` middleware group load `@newtalaria/browser`. That script's tracing (pageload, fetch, web vitals) follows the same project document. See [Best practices](best-practices.md).

## Related

- [Laravel SDK](README.md)
- [PHP instrumentation](../php/instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Configuration](../../getting-started/configuration.md)
