---
title: Node.js SDK
description: Install @newtalaria/node and capture errors with Talaria.
sdk: node
package: @newtalaria/node
tags: [node, javascript, install]
---

# Node.js SDK

## Prerequisites / supported versions

- Node.js LTS for install tooling; see npm package docs for runtime support.

## Package name + install command

```bash
npm install @newtalaria/node
```

## Initialization

```javascript
import { Talaria } from '@newtalaria/node';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.TALARIA_API_KEY,
  environment: 'production',
  release: '1.0.0',
  minLevel: 'warning',
});
```

## App init vs Project settings

Init holds DSN, API key, environment, release. Tracing, analytics, heatmaps, and session replay follow [Project configuration](../../getting-started/configuration.md). Set `remoteConfig: false` only when you intentionally want errors-only without fetching policy.

## API key / DSN / environment variables

> [!WARNING]
> Never commit `tal_live_` keys. Use `.env` / CI secrets as `TALARIA_API_KEY`.

## Optional features

Enable tracing / analytics / heatmaps / replay in Project settings. Wire `analytics.optIn()` after consent where required. Browser packages support session replay and Web Vitals; Node does not.

## Verification

Capture a test exception; dashboard Issues or MCP `search_errors` / `get_project_stats`.

## Troubleshooting

Rejected keys cache ~24h. Confirm Project settings before expecting spans or replay.

## Related docs

- [Configuration](../../getting-started/configuration.md)
- [Agent playbook](../../guides/add-talaria-with-an-agent.md)
- [SDK hub](../README.md)
