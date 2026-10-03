---
title: JavaScript best practices
description: Release, sampling, analytics, feature flags, session replay, heatmaps, web vitals, and consent for @newtalaria/browser.
sdk: javascript
package: "@newtalaria/browser"
tags: [javascript, analytics, feature-flags, replay, heatmaps, consent, sampling, release]
---

# JavaScript best practices

## Release

Send `release` as a version or git SHA on every event. Upload source maps for that same string. A local run can use `local`. Production should use the build's version or SHA, not a hardcoded `1.0.0` left over from a sample.

## API key and environment

The API key chooses the environment. Do not pass `environment` in `Talaria.init`. Use a development key locally and a production key on the deployed app. Keep the key out of git if the repository is public; it is still safe to ship inside the browser bundle.

## Sampling

Event sampling and trace sampling come from Project settings after `sdk/getConfig`. Successful traces follow the traces sample rate. Error traces stay. A response with `retry: false` stops that signal until the page reloads.

## Project settings

Tracing, analytics, heatmaps, and session replay stay off until the project document allows them. Init cannot turn those signals on by itself. See [Project configuration](../../getting-started/configuration.md).

## Analytics

Enable **Analytics** in Project settings, then send product events:

```javascript
Talaria.analytics.identify('user_42', { plan: 'pro' });
Talaria.analytics.page('Pricing');
Talaria.analytics.track('Checkout Started', { plan: 'pro' });
```

Browser analytics wait for consent unless you opt the page in. See [Product analytics setup](../../analytics/setup.md).

## Feature flags

```javascript
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

`stringVariation` and `jsonVariation` take a key and a default the same way. Evaluation uses the environment of the API key. A flag that is off returns the default.

## Session replay

Enable session replay in Project settings and set the session sample rate and the error-linked sample rate. The SDK records the session and attaches the recording to errors from that visit. `maskAllInputs` defaults to true. `getReplayId()` returns the current replay id when one is open.

Replay starts only when the project allows it and the visitor consent state allows analytics. Error capture does not wait for that consent.

## Heatmaps

Enable heatmaps and analytics in Project settings. The SDK records clicks, scroll depth, and page snapshots for pages that have consented. Mask inputs and use `blockSelector` or `[data-talaria-mask]` for blocks that should not appear in a snapshot.

## Web Vitals

LCP, INP, CLS, and TTFB are child spans of the pageload transaction. They show up when tracing is on and that pageload was sampled. See [Instrumentation and tracing](instrumentation.md).

## Consent

The browser SDK follows CookieYes, Cookiebot, and Google Consent Mode `analytics_storage` without extra code. That choice also holds or starts session replay. For any other banner:

```javascript
Talaria.analytics.optIn();
Talaria.analytics.optOut();
```

A page with no banner can set `publicAnalytics: true` so the browser opts in when the project allows analytics. Leave it unset when a banner Talaria already reads is on the page. Details: [Cookie banners](../../analytics/consent.md).

## Privacy in events

Do not put tokens, passwords, or raw card numbers in `extra`, tags, or breadcrumb data. Tags should stay low-cardinality (`service`, `area`, `feature`). Put the release and the user id in the fields made for them.

## Verify

After a change, `search_errors` or `search_events` with the environment of the key you used. `get_project_stats` counts analytics volume and stays at 0 for that environment while analytics is off.

## Related

- [JavaScript SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
