---
title: Node.js tracing
description: Incoming SERVER spans, outgoing CLIENT spans, and database wrappers.
section: sdk
order: 53
---

`handleHttpRequest` records incoming HTTP SERVER spans. Outgoing `http`/`https` calls record CLIENT spans and send W3C `traceparent`. Optional wrappers cover `pg`, `mysql2`, `ioredis`, and `@duckdb/node-api`. Prisma, Drizzle, and Kysely record SQL when you wrap the pool they use. Knex and Sequelize open their own connections — use the instrumentation hooks in the package if you need those.

Tracing still follows [project settings](/get-started/project-settings/).
