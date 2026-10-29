---
title: Node.js configuration
description: 'Release, sampling, analytics, and feature flags for @newtalaria/node.'
package: '@newtalaria/node'
tags:
  - node
  - analytics
  - feature-flags
  - sampling
  - release
id: node-configuration
navTitle: Configuration
type: guide
section: platforms
platform:
  - node
feature:
  - analytics
  - feature-flags
order: 50
lastReviewed: '2026-10-29'
owner: docs
---
# Node.js configuration

## What you're setting up

Release, sampling, analytics, and feature flags for @newtalaria/node.

## Steps

### 1. Release

Set `release` from the deployed version or git SHA (`TALARIA_RELEASE`). Local processes should still send a version or SHA. The dashboard groups release health by that string.

### 2. API key and environment

`TALARIA_API_KEY` chooses the environment. Do not pass `environment` in init. Use a development key on your laptop and a production key in the deployed service. Restart the process after rotating a key. A rejected key is cached for about 24 hours.

### 3. Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. Event sampling uses the event sample rate on the same document. A response with `retry: false` stops that signal until the process restarts.

### 4. Project settings

Tracing and analytics follow [Project configuration](../../get-started/project-settings.md). Init does not turn them on. Session replay, heatmaps, and web vitals are recorded by `@newtalaria/browser` in the page, not by this process.

### 5. Analytics

Enable Analytics in Project settings. Node follows that document. There is no cookie banner on the server.

```javascript
Talaria.analytics.identify('user_42', { plan: 'pro' });
Talaria.analytics.track('Invoice Sent', { plan: 'pro' });
```

Pass the user id you already have. `page` and `screen` exist on the same client when you are recording a view from the server. See [Product analytics setup](../../features/analytics.md).

### 6. Feature flags

```javascript
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

`stringVariation` and `jsonVariation` take a key and a default. Evaluation uses the API key's environment. When the flag is disabled, the default is returned.

### 7. Privacy in events

Do not put tokens or raw SQL parameters into `extra` or breadcrumb `data`. Database wrappers, including `wrapDuckDB`, store the statement with literals removed. Bound values and result rows stay in the app. Prefer parameterized queries so values stay out of the SQL string.

## Check it worked

`search_issues` and `search_events` with the environment of the key this process used. `get_project_stats` analytics counts stay at 0 while analytics is off.

## Next steps

- [Node.js SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
