---
title: Analytics
description: Turn product analytics on, send track, page, and screen events, and respect visitor consent.
section: guides
order: 150
---

Product analytics is off until you enable it in [project settings](/get-started/project-settings/). Official SDKs then send events to `POST /v1/analytics` on the ingest host (`https://ingest-nz1.newtalaria.com` for nz1) when the key has `analytics:write`.

## Events

Use `track`, `page`, `screen`, and `identify` on the official SDK analytics API. JavaScript exposes `Talaria.analytics.track` (and the same verbs). Flutter's `TalariaNavigatorObserver` emits `$screen` as you navigate. There is no click autocapture; send the events you care about.

```ts
Talaria.analytics.identify('user-123');
Talaria.analytics.page('Pricing');
Talaria.analytics.track('signup_completed', { plan: 'team' });
```

## Consent

Browser and Flutter clients wait for visitor consent before they send analytics. CookieYes, Cookiebot, and Google Consent Mode (`analytics_storage`) are followed automatically. Any other banner should call `optIn()` after agreement and `optOut()` to stop. A page with no banner can set `publicAnalytics: true` when that is appropriate.

See [Cookie banners](/guides/cookie-banners/). Error capture does not wait for a banner.

## Heatmaps

Heatmaps need analytics on, the heatmap switch on in project settings, and the same consent as analytics. Screen heatmaps use the Flutter or mobile screen events.

## Related

- [Project settings](/get-started/project-settings/)
- [Ingest API](/reference/ingest-api/)
- [Billing](/billing/) — what is metered lives on [pricing](https://www.newtalaria.com/pricing)
