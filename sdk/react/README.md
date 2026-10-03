---
title: React SDK
description: Quick setup for @newtalaria/react — install, init, ErrorBoundary, and the first error. Tracing, replay, analytics, and feature flags.
sdk: react
package: "@newtalaria/react"
tags: [react, javascript, install, init]
---

# React SDK

`@newtalaria/react` (0.5.3) re-exports `@newtalaria/browser` and adds an error boundary, the React 19 error handler, a Profiler, and a React Router helper.

## Quick setup

```bash
npm install @newtalaria/react
```

Init once, before `createRoot`. The API key is a public client ingest credential. A bundler may inline it at build time. The key decides the environment.

```javascript
import { Talaria } from '@newtalaria/react';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: 'tal_live_…',
  release: '1.0.0',
  minLevel: 'warning',
});
```

Wrap the tree so a render error is captured:

```tsx
import { ErrorBoundary } from '@newtalaria/react';

<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <App />
</ErrorBoundary>
```

Confirm with MCP `search_errors` and `environment: development`.

## What you can do

| Capability | Where |
| --- | --- |
| Browser errors plus `ErrorBoundary` and the React 19 handler | [Errors, logs, and breadcrumbs](errors.md) |
| Browser spans, Profiler commits, and React Router | [Instrumentation and tracing](instrumentation.md) |
| Analytics, feature flags, session replay, heatmaps, and consent | [Best practices](best-practices.md) |
| Source maps | [JavaScript source maps](../javascript/source-maps.md) |

Logs, breadcrumbs, identity, web vitals, replay, and heatmaps are the browser SDK. Tracing and the other product signals follow [Project configuration](../../getting-started/configuration.md).

## Install

```bash
npm install @newtalaria/react
```

## Initialization

```javascript
import { Talaria } from '@newtalaria/react';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: 'tal_live_…',
  release: '1.4.2',
  minLevel: 'warning',
});
```

## App init vs Project settings

Init holds `dsn`, `apiKey`, `release`, and `minLevel`. The API key decides the environment. Tracing, analytics, heatmaps, and session replay follow Project settings. Set `remoteConfig: false` only when you want errors without fetching that document.

## API key

Pass the key from the build, not from a Node `process.env` read at runtime in the browser. A development key is what `setup_project` returns. A deployed app that should report production uses a production key. Send `release` as a version or SHA, and upload source maps for that same release.

## Verification

Trigger a render error inside `ErrorBoundary`, or call `Talaria.captureException`. Look in Issues, or call `search_errors` with `environment: development`.

## Troubleshooting

A rejected key is cached for about 24 hours. Reload after you rotate it. Profiler spans and replay stay empty until Project settings allow them.

## Related docs

- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](best-practices.md)
- [Browser SDK](../javascript/README.md)
- [Configuration](../../getting-started/configuration.md)
