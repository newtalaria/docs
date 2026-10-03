---
title: Node.js SDK
description: Quick setup for @newtalaria/node — install, init, and capture the first error. HTTP tracing, database wrappers, analytics, and feature flags.
sdk: node
package: "@newtalaria/node"
tags: [node, javascript, install, init]
---

# Node.js SDK

`@newtalaria/node` (0.5.3) is the Node.js server SDK. Browser apps use `@newtalaria/browser`. Next.js should use `@newtalaria/nextjs` so the client and server stay on the right entrypoints.

## Quick setup

```bash
npm install @newtalaria/node
```

```javascript
import { Talaria } from '@newtalaria/node';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.TALARIA_API_KEY,
  release: process.env.TALARIA_RELEASE ?? 'dev',
  minLevel: 'warning',
});

await Talaria.captureException(new Error('talaria hello'));
await Talaria.flush();
```

The key decides the environment. Do not pass `environment`. A local `setup_project` key is a development key. Confirm with `search_errors` and `environment: development`.

## What you can do

| Capability | Where |
| --- | --- |
| Process errors, `captureMessage`, breadcrumbs, user, and tags | [Errors, logs, and breadcrumbs](errors.md) |
| Incoming HTTP, outgoing HTTP, `pg`, `mysql2`, and Redis | [Instrumentation and tracing](instrumentation.md) |
| Analytics and feature flags | [Best practices](best-practices.md) |

`logger()` is the browser API. On Node, record a message with `captureMessage`. Tracing and analytics follow [Project configuration](../../getting-started/configuration.md).

`@newtalaria/node/api` is the HTTP-free facade used by Next.js. It does not patch HTTP. Application code should import `@newtalaria/node`.

## Install

```bash
npm install @newtalaria/node
```

## Initialization

```javascript
import { Talaria } from '@newtalaria/node';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.TALARIA_API_KEY,
  release: process.env.TALARIA_RELEASE,
  commitSha: process.env.TALARIA_COMMIT_SHA,
  minLevel: 'warning',
  tags: { service: 'api' },
});
```

Init installs outgoing HTTP instrumentation that waits until project config enables tracing. Call `handleHttpRequest` on each incoming request. See [Instrumentation and tracing](instrumentation.md).

## App init vs Project settings

Init holds the DSN, API key, release, and tags. Tracing and analytics turn on from Project settings. Set `remoteConfig: false` only for an errors-only process that should not fetch policy.

## API key

Store `TALARIA_API_KEY` in the environment. The prefix stays `tal_live_`. The server stamps the key's environment on ingest. Send `release` as a version or SHA on every process, including local runs.

## Verification

`await Talaria.captureException(new Error('talaria hello'))`, then `await Talaria.flush()` in a short-lived script. MCP `search_errors` with `environment: development`.

## Troubleshooting

A rejected key is cached for about 24 hours. Restart the process after rotating it. Outgoing spans appear only after tracing is enabled and `getConfig` has been applied.

## Related docs

- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Configuration](../../getting-started/configuration.md)
