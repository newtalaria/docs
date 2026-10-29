---
title: JavaScript SDK
description: >-
  Install the Talaria javascript SDK and capture errors, logs, and traces from
  your javascript application.
package: '@newtalaria/browser'
tags:
  - javascript
  - install
  - init
  - browser
id: javascript
navTitle: Overview
type: quickstart
section: platforms
platform:
  - javascript
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# JavaScript SDK

`@newtalaria/browser` (0.5.3) is the browser SDK. Install this package in a plain web app. React, Next.js, and framework adapters that inject a script use their own guides.

## Quick setup

1. Install the package and init once, before the rest of the app runs.
2. Send one exception.
3. Confirm it with MCP `search_issues` and `environment: development`, or open Issues in the dashboard.

```bash
npm install @newtalaria/browser
```

```javascript
import { Talaria } from '@newtalaria/browser';

Talaria.init({
  apiKey: 'tal_pk_prod_nz1_…',
  release: '1.0.0',
  minLevel: 'warning',
});

await Talaria.captureException(new Error('talaria hello'));
await Talaria.flush();
```

`tal_pk_prod_nz1_…` keys are public client ingest credentials. Put the key in the bundle through your build (an env var replaced at build time is fine). The key decides the environment. This SDK refuses a secret `tal_sk_` key or a `tal_mon_` token at init. A local install uses a development key. Do not pass `environment` in init.

> [!CAUTION]
> When using Vite, use `VITE_TALARIA_BROWSER_API_KEY` for browser code. **Never** use `VITE_TALARIA_API_KEY` or `VITE_TALARIA_RELEASE_KEY`—server keys must not carry a public prefix. For server code, use the unprefixed variables.

`minLevel: 'warning'` drops info and debug messages. `captureException` is an error, so this setup still shows up in Issues.

## What you can do

| Capability | Where |
| --- | --- |
| Errors, logs, breadcrumbs, user, tags, and release | [Errors, logs, and breadcrumbs](errors.md) |
| Pageload, navigation, fetch/XHR, web vitals, and manual spans | [Instrumentation and tracing](tracing.md) |
| Analytics, feature flags, session replay, heatmaps, and consent | [Best practices](configuration.md) |
| Source maps for a minified stack | [Source maps](../../guides/upload-javascript-source-maps.md) |

Tracing, analytics, heatmaps, and session replay follow [Project configuration](../../get-started/project-settings.md). Until that document arrives, the page sends errors only.

## Install

```bash
npm install @newtalaria/browser
```

Node.js services use [`@newtalaria/node`](../node/README.md). Do not install `@newtalaria/core` on its own.

## Initialization

Call `Talaria.init` once. Later calls are ignored.

```javascript
import { Talaria } from '@newtalaria/browser';

Talaria.init({
  apiKey: 'tal_pk_prod_nz1_…',
  release: '1.4.2',
  commitSha: 'abc123',
  minLevel: 'warning',
  tags: { service: 'web' },
});
```

Set `remoteConfig: false` only when this page should send errors and skip the project configuration fetch.

## App init vs Project settings

| App init | Project settings |
| --- | --- |
| `url`, `apiKey`, `release`, `commitSha`, `minLevel`, `tags` | Tracing on/off and the traces sample rate |
| `networkErrorOrigins`, `beforeSend` | Analytics, heatmaps, and session replay |
| `publicAnalytics` when the page has no banner Talaria reads | Sample rates for replay |

## API key

The key decides the environment. Each key is bound to development, test, staging, or production, and Publishable keys look like `tal_pk_<env>_nz1_…` and secret keys look like `tal_sk_<env>_nz1_…`. The server stamps that value on ingest. A deployed app that should report production uses a production key. Local install, including `setup_project`, uses a development key. Send `release` as a version or git SHA. The same string is the release you upload source maps for.

## Verification

1. Run the page with a development key.
2. Call `Talaria.captureException` (or throw from `window`).
3. MCP `search_issues` with `environment: development`, or open Issues and switch the shell to Development.

## Troubleshooting

A rejected key is cached for about 24 hours. Rotate the key and reload the page. Spans, replay, and heatmaps stay quiet until Project settings allow them and the project config fetch has refreshed (default about five minutes, or reload).

## Related docs

- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [Source maps](../../guides/upload-javascript-source-maps.md)
- [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md)
- [Configuration](../../get-started/project-settings.md)
- [SDK hub](../README.md)
