---
title: React configuration
description: >-
  Release, sampling, analytics, feature flags, session replay, heatmaps, and
  consent for @newtalaria/react.
package: '@newtalaria/react'
tags:
  - react
  - analytics
  - feature-flags
  - replay
  - heatmaps
  - consent
  - sampling
  - release
id: react-configuration
navTitle: Configuration
type: guide
section: platforms
platform:
  - react
feature:
  - analytics
  - feature-flags
order: 50
lastReviewed: '2026-10-29'
owner: docs
---
# React configuration

## What you're setting up

Release, sampling, analytics, feature flags, session replay, heatmaps, and consent for @newtalaria/react.

## Steps

### 1. Release

Set `release` in `Talaria.init` to the version or git SHA of this build. Upload source maps for that same string. See [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md).

### 2. API key and environment

The API key chooses the environment. Do not pass `environment` in init. Use a development key locally and a production key on the deployed bundle.

### 3. Sampling

Successful traces follow the traces sample rate from Project settings. Error traces stay. A response with `retry: false` stops that signal until the page reloads.

### 4. Project settings

Tracing, analytics, heatmaps, and session replay follow the project document, not init flags. See [Project configuration](../../get-started/project-settings.md).

### 5. Analytics

```javascript
import { Talaria } from '@newtalaria/react';

Talaria.analytics.identify('user_42', { plan: 'pro' });
Talaria.analytics.page('Pricing');
Talaria.analytics.track('Checkout Started', { plan: 'pro' });
```

Enable Analytics in Project settings first. Consent is the browser SDK's consent. See [Product analytics setup](../../features/analytics.md).

### 6. Feature flags

```javascript
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

### 7. Session replay

Replay, input masking, and `getReplayId()` are the browser SDK. Enable session replay in Project settings. Replay waits for the same consent state as analytics. Error capture does not wait. See [Browser best practices](../javascript/configuration.md).

### 8. Heatmaps

Enable heatmaps and analytics. Clicks, scroll depth, and snapshots use the browser recorder. Mask inputs and mark private blocks with `[data-talaria-mask]` or `blockSelector`.

### 9. Web Vitals

LCP, INP, CLS, and TTFB are child spans of the pageload when tracing is on and that pageload was sampled.

### 10. Consent

CookieYes, Cookiebot, and Google Consent Mode are followed automatically. Any other banner calls `Talaria.analytics.optIn()` after agreement and `optOut()` to stop. `publicAnalytics: true` opts the page in when there is no banner. Details: [Cookie banners](../../guides/cookie-banners.md).

### 11. Privacy in events

Keep tokens and passwords out of `extra`, tags, and breadcrumbs. The component stack on a React error is useful; a prop dump of a form is not.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [React SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
