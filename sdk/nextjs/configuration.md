---
title: Next.js configuration
description: >-
  Release, sampling, analytics, feature flags, session replay, heatmaps, and
  consent for @newtalaria/nextjs.
package: '@newtalaria/nextjs'
tags:
  - nextjs
  - analytics
  - feature-flags
  - replay
  - heatmaps
  - consent
  - sampling
  - release
id: nextjs-configuration
navTitle: Configuration
type: guide
section: platforms
platform:
  - nextjs
feature:
  - analytics
  - feature-flags
order: 50
lastReviewed: '2026-10-29'
owner: docs
---
# Next.js configuration

## What you're setting up

Release, sampling, analytics, feature flags, session replay, heatmaps, and consent for @newtalaria/nextjs.

## Steps

### 1. Release

Set the same `release` on `initClient`, `initServer`, and `initEdge`. Upload browser source maps with `@newtalaria/cli` for that string. `withTalariaConfig` only adjusts the Next build (server externals, and hiding browser source maps in the production bundle). It does not upload maps. See [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md).

### 2. API key and environment

The key decides the environment. The browser client refuses a secret `tal_sk_` key or a `tal_mon_` token at init. The publishable key belongs in `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY`. The server uses a secret key in `TALARIA_API_KEY` and logs one warning on a publishable key. Do not pass `environment` in init. Local install uses a development key.

### 3. Sampling

On the client and the Node server, successful traces follow the project traces sample rate. Error traces stay. Edge does not sample traces because it does not send spans. A response with `retry: false` stops that signal on the client until reload, and on the server until the process restarts. Edge does not apply that switch.

### 4. Project settings

Client and server tracing, analytics, heatmaps, and replay follow [Project configuration](../../get-started/project-settings.md). Edge ignores that document.

### 5. Analytics

Client and server both expose `Talaria.analytics`. Edge does not.

```javascript
Talaria.analytics.identify('user_42', { plan: 'pro' });
Talaria.analytics.page('Pricing');
Talaria.analytics.track('Checkout Started', { plan: 'pro' });
```

Enable Analytics in Project settings. The client still waits for [consent](../../guides/cookie-banners.md). The server follows the project document and has no document consent step. Server calls should pass the user id you already know. See [Product analytics setup](../../features/analytics.md).

### 6. Feature flags

Client and server:

```javascript
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

Edge has no flag client. Read the flag on the server and pass the result down.

### 7. Session replay

Replay runs in the browser client when session replay is enabled in Project settings. It uses the same masking and consent rules as [`@newtalaria/browser`](../javascript/configuration.md). The server and edge do not record replays.

### 8. Heatmaps

Heatmaps run in the browser client when analytics and heatmaps are enabled and the visitor has consented.

### 9. Web Vitals

LCP, INP, CLS, and TTFB are recorded in the browser client as child spans of the pageload.

### 10. Consent

CookieYes, Cookiebot, and Google Consent Mode apply to the client bundle. Call `Talaria.analytics.optIn()` from client code for any other banner. Do not call opt-in from a Server Component that has not seen the visitor's choice.

### 11. Privacy in events

Keep secrets out of server action arguments that you copy into `extra`. The component stack and the route name are enough to find the failure.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [Next.js SDK](README.md)
- [Instrumentation and tracing](tracing.md)
- [Errors, logs, and breadcrumbs](errors.md)
