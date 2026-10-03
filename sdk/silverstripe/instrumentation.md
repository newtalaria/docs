---
title: Silverstripe instrumentation and tracing
description: HTTP middleware, MySQL query spans, Guzzle, and queued-job traces in talaria/silverstripe, plus the injected browser SDK.
sdk: silverstripe
package: talaria/silverstripe
tags: [silverstripe, instrumentation, tracing, spans, http, mysql, guzzle, queues]
---

# Silverstripe instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). The module's HTTP middleware, MySQL wrapper, Guzzle factory, and queued-job hooks record spans when that document allows tracing. Successful transactions follow the traces sample rate. Error transactions are always sent.

Spans use the OpenTelemetry span model. Incoming HTTP and outgoing Guzzle carry W3C `traceparent`.

## HTTP

The module's middleware opens a SERVER span for the request. The span follows the method and route. Request tags (`ajax`, `ss_env`, `host`) are applied for that request and are not written onto the long-lived client with `setTags`.

## MySQL

`TracingMySQLDatabase` records CLIENT spans for queries. Query text is on the span. Identical work under one parent can roll up. Keep bound values out of the SQL string.

## Guzzle

Application Guzzle clients created through the module's factory get `GuzzleMiddleware`: a CLIENT span, a breadcrumb, and `traceparent`. Talaria's ingest client is not wrapped. If you construct Guzzle yourself, push the middleware as in the [PHP guide](../php/instrumentation.md).

## Queued jobs

When the queued-jobs module is installed, a job gets a producer span and a CONSUMER transaction. The consumer continues the trace into the worker.

## Manual spans

```php
use Talaria\Talaria;

$span = Talaria::startSpan('checkout.charge');
try {
    $this->charge();
} finally {
    $span->end();
}
```

## Browser script

`enableBrowserCms` and `enableBrowserFrontend` (both default true) load `@newtalaria/browser` from jsDelivr at `browserSdkVersion` (default `0.5.3`). CMS sets `inlineStylesheet` so admin CSS is in the replay snapshot. CMS promotes failed HTTP 400–599. The public site promotes 500–599. Pageload, fetch, and web vitals in that script follow the same project tracing switch. See [Best practices](best-practices.md).

## Related

- [Silverstripe SDK](README.md)
- [PHP instrumentation](../php/instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Configuration](../../getting-started/configuration.md)
