---
title: Node.js best practices
description: Release, sampling, analytics, and feature flags for @newtalaria/node.
sdk: node
package: "@newtalaria/node"
tags: [node, analytics, feature-flags, sampling, release]
---

# Node.js best practices

## Release

Set `release` from the deployed version or git SHA (`TALARIA_RELEASE`). Local processes should still send a version or SHA. The dashboard groups release health by that string.

## API key and environment

`TALARIA_API_KEY` chooses the environment. Do not pass `environment` in init. Use a development key on your laptop and a production key in the deployed service. Restart the process after rotating a key. A rejected key is cached for about 24 hours.

## Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. Event sampling uses the event sample rate on the same document. A response with `retry: false` stops that signal until the process restarts.

## Project settings

Tracing and analytics follow [Project configuration](../../getting-started/configuration.md). Init does not turn them on. Session replay, heatmaps, and web vitals are recorded by `@newtalaria/browser` in the page, not by this process.

## Analytics

Enable Analytics in Project settings. Node follows that document. There is no cookie banner on the server.

```javascript
Talaria.analytics.identify('user_42', { plan: 'pro' });
Talaria.analytics.track('Invoice Sent', { plan: 'pro' });
```

Pass the user id you already have. `page` and `screen` exist on the same client when you are recording a view from the server. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

```javascript
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

`stringVariation` and `jsonVariation` take a key and a default. Evaluation uses the API key's environment. When the flag is disabled, the default is returned.

## Privacy in events

Do not put tokens or raw SQL parameters into `extra` or breadcrumb `data`. Database wrappers, including `wrapDuckDB`, store the statement with literals removed. Bound values and result rows stay in the app. Prefer parameterized queries so values stay out of the SQL string.

## Verify

`search_errors` and `search_events` with the environment of the key this process used. `get_project_stats` analytics counts stay at 0 while analytics is off.

## Related

- [Node.js SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
