---
title: Node.js
description: Install @newtalaria/node 0.6.1 for process errors and HTTP spans.
section: sdk
order: 50
---

`@newtalaria/node` **0.6.1** captures process errors, incoming HTTP SERVER spans, outgoing `http`/`https` CLIENT spans with W3C `traceparent`, and optional `pg` / `mysql2` / `ioredis` / `@duckdb/node-api` wrappers. Prisma, Drizzle, and Kysely record SQL when you wrap the pool they use.

Building Next.js? Install [`@newtalaria/nextjs`](/sdk/javascript/nextjs/) instead.

## Install

```bash
npm install @newtalaria/node
```

## Initialise

```ts
import http from 'node:http';
import { Talaria, handleHttpRequest } from '@newtalaria/node';

Talaria.init({
  apiKey: process.env.TALARIA_API_KEY!, // tal_sk_…
  remoteConfig: true,
});

http.createServer((req, res) => {
  handleHttpRequest(req, res);
  res.end('ok');
}).listen(3000);
```

The API key decides the environment. Long-lived workers should call `Talaria.resetRequestState()` between jobs.

## Verify

```ts
Talaria.captureException(new Error('Talaria test error'));
```

Run this once, then open **Issues** in the [dashboard](https://one.newtalaria.com). The test error shows as a new issue in the key's environment. Nothing there? See [troubleshooting](/sdk/javascript/troubleshooting/).

## Next

See [configuration](/sdk/javascript/node/configuration/), [errors](/sdk/javascript/node/errors/), and [tracing](/sdk/javascript/node/tracing/).
