---
title: Cookie banners and consent
description: >-
  How the browser SDK follows CookieYes, Cookiebot, and Google Consent Mode for
  GDPR compliance.
tags:
  - analytics
  - consent
  - javascript
id: analytics-consent
navTitle: Cookie banners
type: guide
section: guides
platform:
  - javascript
  - react
  - nextjs
feature:
  - analytics
order: 20
lastReviewed: '2026-10-29'
owner: docs
---

# Cookie banners

## What you're setting up

The browser SDK reads a cookie banner that is already on the page. For a banner it recognizes, you do not add a listener and you do not call `analytics.optIn()`. When that banner allows analytics, product analytics, heatmaps, and session replay turn on.

## Why use this

Error capture does not wait for the banner. Analytics, heatmaps, and session replay do. Talaria does not store a second consent cookie. The banner remains the source of truth.

## Before you start

Install the banner the way you already do. Talaria subscribes at `init`, including when the banner script arrives later (for example from Google Tag Manager).

Leave `publicAnalytics` unset when a banner is in charge. A detected banner that has not granted analytics keeps analytics, heatmaps, and replay off for that page.

The SDK does not detect the visitor's country, and it does not use locale, timezone, or a geolocation call to start analytics. Country and region on an analytics event are added on the server from the request IP after that event is allowed through. The IP is not stored.

## Steps

### 1. Initialize Talaria

```javascript
import { Talaria } from '@newtalaria/browser';

Talaria.init({
  apiKey: 'tal_pk_prod_nz1_…',
  release: '1.4.2',
});
```

### 2. Use a banner Talaria reads

**CookieYes.** The analytics category. Talaria listens for `cookieyes_banner_load` and `cookieyes_consent_update`, and reads `getCkyConsent()` when the banner script ran first. The category id stays `analytics` even if the banner label is renamed. A banner that is on screen and waiting for a choice holds replay. It does not count as a rejection until the visitor decides.

**Cookiebot.** The statistics category (`Cookiebot.consent.statistics`), including a choice already stored from an earlier visit. Necessary, preferences, and marketing do not turn measurement on.

**Google Consent Mode.** `analytics_storage` on the `dataLayer` consent `default` and `update` commands. `granted` turns measurement on. `denied` turns it off. Ad storage is ignored.

OneTrust and Usercentrics are covered when they send `analytics_storage`. Talaria does not guess OneTrust group ids or Usercentrics service names, because those are chosen per site. If one of those banners never sets `analytics_storage`, use `optIn()` / `optOut()` in the next step.

A CookieYes or Cookiebot decision wins over Consent Mode for that page.

### 3. Wire any other banner

Call the existing analytics methods from the banner you already run. Call them again on each page load. The banner remembers the choice. `optIn()` does not. `optIn()` still lasts only for the current page; a banner Talaria reads will apply its stored choice again on the next load.

```javascript
onConsent((granted) => {
  if (granted) Talaria.analytics.optIn();
  else Talaria.analytics.optOut();
});
```

`optOut()` stops analytics and drops anything still queued. Heatmaps follow that same switch. Session replay on this path follows Project settings. Replay waits for the banner when Talaria is reading CookieYes, Cookiebot, or Consent Mode.

An application that already knows the country, and has decided that visit does not need a banner, calls `analytics.optIn()` itself. `publicAnalytics: true` is the switch for a whole surface that does not use a banner.

## Check it worked

When the banner allows analytics, the browser SDK turns on product analytics, heatmaps, and session replay. When that choice is missing or withdrawn, those three stay off. A withdrawal stops replay and drops segments that have not been sent.

## Troubleshooting

### Analytics stays off

**Cause:** The page has no banner Talaria recognizes, or a detected banner has not granted analytics. Analytics stays off until `analytics.optIn()`, or until `publicAnalytics: true` when the project allows analytics. Replay follows Project settings.

**Fix:** Call `analytics.optIn()` from the banner you already run, or set `publicAnalytics: true` only on a surface that does not use a banner. Leave `publicAnalytics` unset when a banner is in charge.

## Next steps

- [Product analytics setup](../features/analytics.md)
- [Project configuration](../get-started/project-settings.md)
- [JavaScript SDK](../sdk/javascript/README.md)
