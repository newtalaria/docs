---
title: Node.js instrumentation and tracing
description: Incoming and outgoing HTTP, W3C traceparent, and optional pg, mysql2, and Redis wrappers in @newtalaria/node.
sdk: node
package: "@newtalaria/node"
tags: [node, instrumentation, tracing, spans, http, pg, mysql, redis]
---

# Node.js instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). Successful transactions follow the traces sample rate. Error transactions are always sent. Spans follow the OpenTelemetry span model. HTTP propagation uses W3C `traceparent`.

Import `@newtalaria/node` (not `@newtalaria/node/api`) so HTTP is patched.

## Outgoing HTTP

`Talaria.init` installs a patch on `http`, `https`, and `fetch`. The patch waits until the tracer is enabled, so a process that starts before `getConfig` returns still continues `traceparent` on the next outbound call. Requests to Talaria's own base URL are skipped. Do not wrap the SDK's transport yourself.

## Incoming HTTP

Call `handleHttpRequest` at the start of each request. It reads an inbound `traceparent`, opens a SERVER span, and finishes that span when the response ends.

```javascript
import http from 'node:http';
import { Talaria, handleHttpRequest } from '@newtalaria/node';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.TALARIA_API_KEY,
  release: process.env.TALARIA_RELEASE,
});

http.createServer((req, res) => {
  handleHttpRequest(req, res);
  res.end('ok');
}).listen(3000);
```

## Manual spans

```javascript
const span = Talaria.startSpan('checkout.charge', {
  kind: 'internal',
  attributes: { 'app.step': 'charge' },
});
try {
  await charge();
  span?.setStatus('ok');
} catch (error) {
  span?.setStatus('error', error instanceof Error ? error.message : String(error));
  throw error;
} finally {
  span?.end();
}
```

`startTransaction` opens a root span. `setRecordQuerySpans(false)` pauses database spans. `withoutQuerySpans` pauses them for one callback.

## PostgreSQL, MySQL, and Redis

The drivers are peer dependencies you already installed. Wrappers are optional.

```javascript
import { getNodeClient, wrapPg, wrapMysql2, wrapRedis } from '@newtalaria/node';

const pool = wrapPg(getNodeClient(), pgPool);
const mysql = wrapMysql2(getNodeClient(), mysqlPool);
const redis = wrapRedis(getNodeClient(), redisClient);
```

Each query becomes a CLIENT span (`db.system.name` of `postgresql` or `mysql`) and a query breadcrumb. Redis wraps `sendCommand` the same way. Query text is stored on the span. Keep secrets out of the SQL string.

## Related

- [Node.js SDK](README.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Configuration](../../getting-started/configuration.md)
