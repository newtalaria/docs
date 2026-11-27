---
title: Cookie banners
description: Hook CookieYes, Cookiebot, or Google Consent Mode so analytics, replay, and heatmaps wait for consent.
section: guides
order: 170
---

Error capture does not wait for a cookie banner. Product analytics, session replay, and heatmaps do, unless you set `publicAnalytics` on a page with no banner. Enable those surfaces in [project settings](/get-started/project-settings/) first. Details: [Analytics](/guides/analytics/).

Talaria does not set a second consent cookie. It reads the banner you already run. IP country is added server-side after an event is allowed; the IP itself is not stored.

## CookieYes

Map your analytics category so it covers Talaria analytics, replay, and heatmaps. The browser SDK listens for `cookieyes_banner_load` and `cookieyes_consent_update`, and can read `getCkyConsent()`. When CookieYes is on the page, it wins over Google Consent Mode.

## Cookiebot

The SDK reads `Cookiebot.consent.statistics` and listens for `CookiebotOnConsentReady`, `CookiebotOnAccept`, and `CookiebotOnDecline`. Cookiebot also wins over Google Consent Mode when both are present.

## Google Consent Mode

If there is no CookieYes or Cookiebot banner, the SDK follows `analytics_storage` on `dataLayer`. Call `optIn()` only if you are not using one of the banners above.

## Other banners

OneTrust, Usercentrics, or a custom banner work when they publish `analytics_storage` on `dataLayer`, or when you call `Talaria.analytics.optIn()` after agreement and `optOut()` to stop. A page with no banner can set `publicAnalytics: true` when that is appropriate.

Laravel and Silverstripe inject the browser script; that script follows the same banners. Server-side `Talaria::analytics()` does not read a document cookie. Call it only for events you already have a lawful basis to send.

## Related

- [JavaScript configuration](/sdk/javascript/configuration/)
- [Project settings](/get-started/project-settings/)
