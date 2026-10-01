---
title: Cookie banners
description: How the browser SDK follows CookieYes, Cookiebot, and Google Consent Mode, and how to call optIn for any other banner.
tags: [analytics, consent, javascript]
---

# Cookie banners

The browser SDK reads a cookie banner that is already on the page. For a banner it recognizes, you do not add a listener and you do not call `analytics.optIn()`.

Initialize Talaria as usual:

```javascript
import { Talaria } from '@newtalaria/browser';

Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: 'tal_live_…',
  release: '1.4.2',
});
```

Install the banner the way you already do. Talaria subscribes at `init`, including when the banner script arrives later (for example from Google Tag Manager).

## What follows the banner

When the banner allows analytics, the browser SDK turns on product analytics, heatmaps, and session replay.

When that choice is missing or withdrawn, those three stay off. A withdrawal stops replay and drops segments that have not been sent.

Error capture does not wait for the banner.

If the page has no banner Talaria recognizes, analytics stays off until `analytics.optIn()`, or until `publicAnalytics: true` when the project allows analytics. Replay follows Project settings.

Leave `publicAnalytics` unset when a banner is in charge. A detected banner that has not granted analytics keeps analytics, heatmaps, and replay off for that page.

The SDK does not detect the visitor's country, and it does not use locale, timezone, or a geolocation call to start analytics. Country and region on an analytics event are added on the server from the request IP after that event is allowed through. The IP is not stored. An application that already knows the country, and has decided that visit does not need a banner, calls `analytics.optIn()` itself. `publicAnalytics: true` is the switch for a whole surface that does not use a banner.

Talaria does not store a second consent cookie. The banner remains the source of truth. `optIn()` still lasts only for the current page; a banner Talaria reads will apply its stored choice again on the next load.

## Banners Talaria reads

**CookieYes.** The analytics category. Talaria listens for `cookieyes_banner_load` and `cookieyes_consent_update`, and reads `getCkyConsent()` when the banner script ran first. The category id stays `analytics` even if the banner label is renamed. A banner that is on screen and waiting for a choice holds replay. It does not count as a rejection until the visitor decides.

**Cookiebot.** The statistics category (`Cookiebot.consent.statistics`), including a choice already stored from an earlier visit. Necessary, preferences, and marketing do not turn measurement on.

**Google Consent Mode.** `analytics_storage` on the `dataLayer` consent `default` and `update` commands. `granted` turns measurement on. `denied` turns it off. Ad storage is ignored.

OneTrust and Usercentrics are covered when they send `analytics_storage`. Talaria does not guess OneTrust group ids or Usercentrics service names, because those are chosen per site. If one of those banners never sets `analytics_storage`, use `optIn()` / `optOut()` below.

A CookieYes or Cookiebot decision wins over Consent Mode for that page.

## Any other banner

Call the existing analytics methods from the banner you already run. Call them again on each page load. The banner remembers the choice. `optIn()` does not.

```javascript
onConsent((granted) => {
  if (granted) Talaria.analytics.optIn();
  else Talaria.analytics.optOut();
});
```

`optOut()` stops analytics and drops anything still queued. Heatmaps follow that same switch. Session replay on this path follows Project settings. Replay waits for the banner when Talaria is reading CookieYes, Cookiebot, or Consent Mode.

## Related

- [Product analytics setup](setup.md)
- [Project configuration](../getting-started/configuration.md)
- [JavaScript SDK](../sdk/javascript/README.md)
