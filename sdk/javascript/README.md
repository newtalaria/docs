---
title: JavaScript SDK
description: Install @newtalaria/browser and capture errors with Talaria.
sdk: javascript
package: "@newtalaria/browser"
tags: [javascript, install]
---

# JavaScript SDK

## Prerequisites / supported versions

- Node.js LTS for install tooling; see npm package docs for runtime support.

## Package name + install command

```bash
npm install @newtalaria/browser
```

## Initialization

```javascript
import { Talaria } from '@newtalaria/browser';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.TALARIA_API_KEY,
  release: '1.0.0',
  minLevel: 'warning',
});
```

## App init vs Project settings

Init holds DSN, API key, and release. The API key decides the environment. Tracing, analytics, heatmaps, and session replay follow [Project configuration](../../getting-started/configuration.md). Set `remoteConfig: false` only when you intentionally want errors-only without fetching policy.

## API key / DSN / environment variables

`tal_live_…` keys are **public client ingest credentials** (safe in browser and mobile apps). The key decides the environment. Each key is bound to development, test, staging, or production, and the prefix stays `tal_live_`. The server stamps that value on ingest. A deployed app that should report production uses a production key. Local install uses a development key. Pass the key via `.env` / build config as `TALARIA_API_KEY`, and send `release` as a version or SHA.

## Optional features

Enable tracing / analytics / heatmaps / replay in Project settings. The browser SDK follows CookieYes, Cookiebot, and Google Consent Mode when that banner is on the page. For any other banner, call `analytics.optIn()` after consent. See [Cookie banners](../../analytics/consent.md). Browser packages support session replay and Web Vitals; Node does not.

## Verification

Capture a test exception; dashboard Issues or MCP `search_errors` / `get_project_stats`.

## Troubleshooting

Rejected keys cache ~24h. Confirm Project settings before expecting spans or replay.

## Source maps

A minified stack stays minified until maps are uploaded for the same `release`. Follow [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md). The command is `@newtalaria/cli`, with a `releases:write` key kept out of the browser bundle.

## Related docs

- [Source maps](source-maps.md)
- [Upload guide](../../guides/upload-javascript-source-maps.md)
- [Configuration](../../getting-started/configuration.md)
- [Agent playbook](../../guides/add-talaria-with-an-agent.md)
- [SDK hub](../README.md)
