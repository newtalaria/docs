---
title: React best practices
description: Release, sampling, analytics, feature flags, session replay, heatmaps, and consent for @newtalaria/react.
sdk: react
package: "@newtalaria/react"
tags: [react, analytics, feature-flags, replay, heatmaps, consent, sampling, release]
---

# React best practices

## Release

Set `release` in `Talaria.init` to the version or git SHA of this build. Upload source maps for that same string. See [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md).

## API key and environment

The API key chooses the environment. Do not pass `environment` in init. Use a development key locally and a production key on the deployed bundle.

## Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. A response with `retry: false` stops that signal until the page reloads.

## Project settings

Tracing, analytics, heatmaps, and session replay follow the project document, not init flags. See [Project configuration](../../getting-started/configuration.md).

## Analytics

```javascript
import { Talaria } from '@newtalaria/react';

Talaria.analytics.identify('user_42', { plan: 'pro' });
Talaria.analytics.page('Pricing');
Talaria.analytics.track('Checkout Started', { plan: 'pro' });
```

Enable Analytics in Project settings first. Consent is the browser SDK's consent. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

```javascript
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

## Session replay

Replay, input masking, and `getReplayId()` are the browser SDK. Enable session replay in Project settings. Replay waits for the same consent state as analytics. Error capture does not wait. See [Browser best practices](../javascript/best-practices.md).

## Heatmaps

Enable heatmaps and analytics. Clicks, scroll depth, and snapshots use the browser recorder. Mask inputs and mark private blocks with `[data-talaria-mask]` or `blockSelector`.

## Web Vitals

LCP, INP, CLS, and TTFB are child spans of the pageload when tracing is on and that pageload was sampled.

## Consent

CookieYes, Cookiebot, and Google Consent Mode are followed automatically. Any other banner calls `Talaria.analytics.optIn()` after agreement and `optOut()` to stop. `publicAnalytics: true` opts the page in when there is no banner. Details: [Cookie banners](../../analytics/consent.md).

## Privacy in events

Keep tokens and passwords out of `extra`, tags, and breadcrumbs. The component stack on a React error is useful; a prop dump of a form is not.

## Related

- [React SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
