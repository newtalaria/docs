---
title: Next.js best practices
description: Release, sampling, analytics, feature flags, session replay, heatmaps, and consent for @newtalaria/nextjs.
sdk: nextjs
package: "@newtalaria/nextjs"
tags: [nextjs, analytics, feature-flags, replay, heatmaps, consent, sampling, release]
---

# Next.js best practices

## Release

Set the same `release` on `initClient`, `initServer`, and `initEdge`. Upload browser source maps with `@newtalaria/cli` for that string. `withTalariaConfig` only adjusts the Next build (server externals, and hiding browser source maps in the production bundle). It does not upload maps. See [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md).

## API key and environment

The key decides the environment. The client key is public and belongs in `NEXT_PUBLIC_TALARIA_API_KEY`. The server key can stay in `TALARIA_API_KEY`. Do not pass `environment` in init. Local install uses a development key.

## Sampling

On the client and the Node server, successful traces follow the project traces sample rate. Error traces stay. Edge does not sample traces because it does not send spans. A response with `retry: false` stops that signal on the client until reload, and on the server until the process restarts. Edge does not apply that switch.

## Project settings

Client and server tracing, analytics, heatmaps, and replay follow [Project configuration](../../getting-started/configuration.md). Edge ignores that document.

## Analytics

Client and server both expose `Talaria.analytics`. Edge does not.

```javascript
Talaria.analytics.identify('user_42', { plan: 'pro' });
Talaria.analytics.page('Pricing');
Talaria.analytics.track('Checkout Started', { plan: 'pro' });
```

Enable Analytics in Project settings. The client still waits for [consent](../../analytics/consent.md). The server follows the project document and has no document consent step. Server calls should pass the user id you already know. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

Client and server:

```javascript
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

Edge has no flag client. Read the flag on the server and pass the result down.

## Session replay

Replay runs in the browser client when session replay is enabled in Project settings. It uses the same masking and consent rules as [`@newtalaria/browser`](../javascript/best-practices.md). The server and edge do not record replays.

## Heatmaps

Heatmaps run in the browser client when analytics and heatmaps are enabled and the visitor has consented.

## Web Vitals

LCP, INP, CLS, and TTFB are recorded in the browser client as child spans of the pageload.

## Consent

CookieYes, Cookiebot, and Google Consent Mode apply to the client bundle. Call `Talaria.analytics.optIn()` from client code for any other banner. Do not call opt-in from a Server Component that has not seen the visitor's choice.

## Privacy in events

Keep secrets out of server action arguments that you copy into `extra`. The component stack and the route name are enough to find the failure.

## Related

- [Next.js SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
