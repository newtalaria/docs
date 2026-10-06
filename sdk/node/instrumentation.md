---
title: Node.js instrumentation and tracing
description: Incoming and outgoing HTTP, W3C traceparent, and optional pg, mysql2, Redis, and DuckDB wrappers in @newtalaria/node.
sdk: node
package: "@newtalaria/node"
tags: [node, instrumentation, tracing, spans, http, pg, mysql, redis, duckdb, prisma, drizzle, knex, kysely, sequelize]
---

# Node.js instrumentation and tracing

Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). Successful transactions follow the traces sample rate. Error transactions are always sent. Spans follow the OpenTelemetry span model. HTTP propagation uses W3C `traceparent`.

Import `@newtalaria/node` (not `@newtalaria/node/api`) so HTTP is patched.

## Outgoing HTTP

`Talaria.init` installs a patch on `http`, `https`, and `fetch`. The patch waits until the tracer is enabled, so a process that starts before `getConfig` returns still continues `traceparent` on the next outbound call. Requests to Talaria's own base URL are skipped. Do not wrap the SDK's transport yourself.

## Model APIs

Tracing turned on by project setup is enough for the global `fetch` and `http` patches. A `POST` to `api.openai.com` on `/v1/chat/completions`, `/v1/responses`, `/v1/completions`, or `/v1/embeddings`, or a `POST` to `api.anthropic.com` on `/v1/messages`, is one client span. The span name is `{operation} {model}`. Attributes use the OpenTelemetry GenAI names: operation, provider, request model, response model, and input and output token counts when a non-streaming JSON response includes usage. A streaming response records the operation, model, provider, and HTTP status, and leaves the token counts unset. Prompt and completion text are not span attributes.

The span is recorded only while a transaction is already open, such as an incoming request, `handleHttpRequest`, or a Next.js server route. A model call does not start its own transaction.

When a client takes its own `fetch` instead of the global one, wrap that function:

```javascript
import { wrapModelFetch } from '@newtalaria/node';

const client = new OpenAI({ fetch: wrapModelFetch(fetch) });
```

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

## Database clients

Wrap the object that actually runs the SQL, after `Talaria.init`. Call `handleHttpRequest` on the request that runs the query so the database span is a child of that SERVER span. `@newtalaria/node` does not import database drivers. Install the driver in the app, then pass the pool or connection into the matching wrapper.

`wrapPg` and `wrapMysql2` patch `query`. A library records a span when its SQL goes through that method. A library that opens its own connections, or that never calls `query`, needs the snippet further down for that library. Bound parameter values and result rows stay in the app. The SQL text stored on the span has string literals and numbers removed.

### node-postgres (`pg`)

Wrap the `Pool` or `Client` once, where it is constructed. Every later `query` on that object is a CLIENT span with `db.system.name` = `postgresql`.

```javascript
import pg from 'pg';
import { getNodeClient, wrapPg } from '@newtalaria/node';

const pool = wrapPg(
  getNodeClient(),
  new pg.Pool({ connectionString: process.env.DATABASE_URL }),
);

const { rows } = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
```

The value in `[userId]` is the second argument. The wrapper reads the SQL string only. Prefer `$1` placeholders so the value never has to be stripped out of the statement text.

### mysql2

Same shape as `pg`. Wrap the pool from `mysql2/promise`. `db.system.name` is `mysql`.

```javascript
import mysql from 'mysql2/promise';
import { getNodeClient, wrapMysql2 } from '@newtalaria/node';

const pool = wrapMysql2(
  getNodeClient(),
  mysql.createPool(process.env.DATABASE_URL),
);

const [rows] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
```

The callback-style `mysql2` connection also has `query`. Wrap that connection the same way if the app does not use the promise API.

### Redis

`wrapRedis` patches `sendCommand`. `node-redis` passes the command as an array, and the span name uses the first element (`GET`, `SET`). `ioredis` passes a `Command` object; the wrapper reads its `name`, so `redis.get` and `redis.set` are named too. The key and the value are not attributes.

```javascript
import { createClient } from 'redis';
import Redis from 'ioredis';
import { getNodeClient, wrapRedis } from '@newtalaria/node';

const nodeRedis = wrapRedis(getNodeClient(), createClient({ url: process.env.REDIS_URL }));
await nodeRedis.connect();
await nodeRedis.get('session:1');

const ioredis = wrapRedis(getNodeClient(), new Redis(process.env.REDIS_URL));
await ioredis.get('session:1');
```

### DuckDB

When the file imports `@duckdb/node-api`, wrap the connection returned by `instance.connect()`. Leave `DuckDBInstance` itself unwrapped.

```javascript
import http from 'node:http';
import { DuckDBInstance } from '@duckdb/node-api';
import {
  Talaria,
  getNodeClient,
  handleHttpRequest,
  wrapDuckDB,
} from '@newtalaria/node';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.TALARIA_API_KEY,
  release: process.env.TALARIA_RELEASE,
});

const instance = await DuckDBInstance.create('analytics.duckdb');
const connection = wrapDuckDB(getNodeClient(), await instance.connect());

http.createServer(async (req, res) => {
  handleHttpRequest(req, res);
  const reader = await connection.runAndReadAll(
    'SELECT region, count(*) FROM events GROUP BY 1',
  );
  res.end(JSON.stringify(reader.getRowObjectsJS()));
}).listen(3000);
```

`wrapDuckDB` opens a CLIENT span around `run`, `runAndRead`, `runAndReadAll`, `runAndReadUntil`, `stream`, `streamAndRead`, `streamAndReadAll`, `streamAndReadUntil`, `prepare`, `start`, and `startStream`. `prepare` also wraps the statement it returns. That statement's later `run`, `stream`, and `start` use the SQL passed to `prepare`. A `start` or `startStream` span stays open until `getResult`, `read`, `readAll`, or `readUntil`.

The span name is the SQL verb. Attributes are `db.system.name` = `duckdb`, `db.operation.name` (a leading `FROM` is recorded as `SELECT`), and `db.query.text` with string literals and numbers removed. A query breadcrumb records the verb. On throw, `captureException` sends the DuckDB message, including a write conflict, plus the sanitized statement. Bound parameter values and result rows stay in the app.

### Prisma

`PrismaClient` on its own talks to Prisma's query engine. `findMany` and `create` do not call `pg.Pool.query`, so `wrapPg` on some other pool in the same process does not see them.

Use a driver adapter when you want the SQL on the span. The adapter calls `query` on the pool you give it. Wrap that pool first.

```javascript
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { getNodeClient, wrapPg } from '@newtalaria/node';

const pool = wrapPg(
  getNodeClient(),
  new Pool({ connectionString: process.env.DATABASE_URL }),
);
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const users = await prisma.user.findMany();
```

Prisma sends `$1`, `$2`, and the values in a separate list. The span keeps the statement shape. For MySQL, wrap the `mysql2` pool with `wrapMysql2` and pass it to the MySQL adapter the same way.

A client with no adapter still needs a span if you want the operation in the trace. Time the call yourself. The attribute is the model operation. The span does not contain the `where` object.

```javascript
import { Talaria } from '@newtalaria/node';

const span = Talaria.startSpan('user.findMany', {
  kind: 'client',
  attributes: {
    'db.system.name': 'postgresql',
    'db.operation.name': 'findMany',
  },
});
try {
  const users = await prisma.user.findMany();
  span?.setStatus('ok');
  return users;
} catch (error) {
  span?.setStatus('error', error instanceof Error ? error.message : String(error));
  throw error;
} finally {
  span?.end();
}
```

### Drizzle

`drizzle-orm/node-postgres` runs SQL through the `pg` pool you pass in. Wrap the pool, then construct Drizzle with it. `drizzle-orm/mysql2` is the same step with `wrapMysql2`.

```javascript
import pg from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { getNodeClient, wrapPg } from '@newtalaria/node';

const pool = wrapPg(
  getNodeClient(),
  new pg.Pool({ connectionString: process.env.DATABASE_URL }),
);
const db = drizzle(pool);

const rows = await db.execute(sql`select id from users where id = ${userId}`);
```

Drizzle's `sql` template sends the value as a parameter. The wrapper records the statement text from `query`, not the bound value.

### Kysely

`PostgresDialect` holds a `pg` pool and calls `query` on it. Wrap the pool before the dialect. `MysqlDialect` takes a `mysql2` pool wrapped with `wrapMysql2`.

```javascript
import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { getNodeClient, wrapPg } from '@newtalaria/node';

const db = new Kysely({
  dialect: new PostgresDialect({
    pool: wrapPg(
      getNodeClient(),
      new pg.Pool({ connectionString: process.env.DATABASE_URL }),
    ),
  }),
});

const rows = await db.selectFrom('users').select('id').where('id', '=', userId).execute();
```

### Knex

Knex builds its own connections. A `pg` pool created beside it is a different object, and `wrapPg` on that pool does not see Knex. Record the span from Knex's query events. `query.sql` is the statement. `query.bindings` holds the values; leave them off the span.

```javascript
import knex from 'knex';
import { Talaria } from '@newtalaria/node';

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

db.on('query', (query) => {
  query.talariaSpan = Talaria.startSpan(String(query.method || 'QUERY').toUpperCase(), {
    kind: 'client',
    attributes: {
      'db.system.name': 'postgresql',
      'db.operation.name': String(query.method || 'QUERY').toUpperCase(),
      'db.query.text': query.sql,
    },
  });
});

db.on('query-response', (_response, query) => {
  query.talariaSpan?.setStatus('ok');
  query.talariaSpan?.end();
});

db.on('query-error', (error, query) => {
  query.talariaSpan?.setStatus('error', error instanceof Error ? error.message : String(error));
  query.talariaSpan?.end();
});
```

Use `mysql` as `db.system.name` when `client` is `mysql2`.

### Sequelize

Sequelize acquires connections internally. Wrapping a separate `pg` pool does not cover `Model.findAll`. `beforeQuery` and `afterQuery` run around the statement Sequelize compiled. `query.sql` is that statement. Bind parameters stay on the query object.

```javascript
import { Sequelize } from 'sequelize';
import { Talaria } from '@newtalaria/node';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});
const spans = new WeakMap();

sequelize.addHook('beforeQuery', (_options, query) => {
  const sql = typeof query.sql === 'string' ? query.sql : '';
  spans.set(
    query,
    Talaria.startSpan('db postgresql', {
      kind: 'client',
      attributes: {
        'db.system.name': 'postgresql',
        'db.query.text': sql,
      },
    }),
  );
});

sequelize.addHook('afterQuery', (_options, query) => {
  const span = spans.get(query);
  span?.setStatus('ok');
  span?.end();
  spans.delete(query);
});
```

Set `dialect: 'mysql'` and `db.system.name` to `mysql` for a MySQL connection.

### MongoDB and other drivers

There is no wrapper for the MongoDB driver, `better-sqlite3`, or `node:sqlite`. Those clients do not call `query` on `pg` or `mysql2`. Open a CLIENT span around the call and set `db.system.name` to `mongodb` or `sqlite`. Put the operation and the collection or table on the span. Leave filters, documents, and bound values in the app.

```javascript
import { Talaria } from '@newtalaria/node';

const span = Talaria.startSpan('find users', {
  kind: 'client',
  attributes: {
    'db.system.name': 'mongodb',
    'db.operation.name': 'find',
    'db.collection.name': 'users',
  },
});
try {
  const docs = await usersCollection.find({ active: true }).toArray();
  span?.setStatus('ok');
  return docs;
} catch (error) {
  span?.setStatus('error', error instanceof Error ? error.message : String(error));
  throw error;
} finally {
  span?.end();
}
```

## Related

- [Node.js SDK](README.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Configuration](../../getting-started/configuration.md)
