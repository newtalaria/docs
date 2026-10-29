---
title: Next.js SDK
description: >-
  Install the Talaria nextjs SDK and capture errors, logs, and traces from your
  nextjs application.
package: '@newtalaria/nextjs'
tags:
  - nextjs
  - javascript
  - install
  - init
id: nextjs
navTitle: Overview
type: quickstart
section: platforms
platform:
  - nextjs
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# Next.js SDK

## What you're setting up

`@newtalaria/nextjs` (0.5.3) has three runtimes. Import the subpath for the runtime you are in.

| Runtime | Import |
| --- | --- |
| Browser | `@newtalaria/nextjs/client` |
| Node.js server | `@newtalaria/nextjs/server` |
| Edge | `@newtalaria/nextjs/edge` |
| `next.config` | `@newtalaria/nextjs/config` |

**What you can do**

| Capability | Where |
| --- | --- |
| Client and server capture. Edge captures exceptions and messages | [Errors, logs, and breadcrumbs](errors.md) |
| Client browser spans, server actions, route handlers, outgoing HTTP | [Instrumentation and tracing](tracing.md) |
| Client analytics, flags, replay, heatmaps, and consent. Server analytics and flags | [Best practices](configuration.md) |
| Client source maps | [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md) |

Edge has a scope and breadcrumbs and does not open spans, read project config, or send analytics. Client replay, heatmaps, web vitals, and consent run in the browser.

## Why use this

The package root re-exports the client. Prefer the explicit subpath.

## Before you start

Do not pass `environment` in init.

## Steps

### 1. Quick setup

```bash
npm install @newtalaria/nextjs
```

Client (`instrumentation-client.ts`). `NEXT_PUBLIC_` values are inlined into the browser bundle. The publishable key decides the environment. Leave `url` unset on Talaria Cloud. Set `url` or `NEXT_PUBLIC_TALARIA_URL` only for a custom domain.

> [!CAUTION]
> Use `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY` for the browser. **Never** use `NEXT_PUBLIC_TALARIA_API_KEY` or `NEXT_PUBLIC_TALARIA_RELEASE_KEY`—server keys must not carry a public prefix.

```javascript
import { initClient } from '@newtalaria/nextjs/client';

initClient({
  apiKey: process.env.NEXT_PUBLIC_TALARIA_BROWSER_API_KEY,
  release: process.env.NEXT_PUBLIC_TALARIA_RELEASE,
  minLevel: 'warning',
});
```

Server (`instrumentation.ts`):

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initServer } = await import('@newtalaria/nextjs/server');
    initServer({
      apiKey: process.env.TALARIA_API_KEY,
      release: process.env.TALARIA_RELEASE,
    });
  }
}

export async function onRequestError(error, request) {
  const { captureRequestError } = await import('@newtalaria/nextjs/server');
  captureRequestError(error, request);
}
```

Wrap `next.config` so the Node SDK stays on the server:

```javascript
import { withTalariaConfig } from '@newtalaria/nextjs/config';

export default withTalariaConfig({
  // your next config
});
```

Send a client exception and confirm with `search_issues` and `environment: development`.

### 2. Install

```bash
npm install @newtalaria/nextjs
```

### 3. Initialization

Call `initClient` from `instrumentation-client.ts`, `initServer` from the Node branch of `instrumentation.ts`, and `initEdge` from the edge branch. Use a publishable key (`NEXT_PUBLIC_TALARIA_BROWSER_API_KEY`) on the client and a secret key (`TALARIA_API_KEY`) in Node and Edge. Each key's environment is what events from that runtime report.

`withTalariaConfig` sets server externals so `@newtalaria/node` is not bundled into the browser. It does not upload source maps. Upload those with `@newtalaria/cli` for the same `release` as `initClient`.

### 4. App init vs Project settings

Client and server load tracing, analytics, heatmaps, and replay from [Project settings](../../get-started/project-settings.md). Edge does not fetch that document. Set `remoteConfig: false` on the client or server only when that runtime should send errors without the document.

### 5. API key

A local `setup_project` key is a development key. Production traffic needs a production key. Send `release` as a version or SHA.

## Check it worked

Throw in a client component and in a server action you wrapped with `withServerAction`. `search_issues` with `environment: development` should show both.

## Troubleshooting

A rejected key is cached for about 24 hours. Reload the page or restart the server after rotating it. Server spans stay empty until tracing is on in Project settings and `initServer` has run.

## Next steps

- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [Configuration](../../get-started/project-settings.md)
