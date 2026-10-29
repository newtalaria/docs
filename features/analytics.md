---
title: Product analytics
description: 'Track user behavior, page views, and custom events with product analytics.'
tags:
  - analytics
id: analytics
navTitle: Analytics
type: feature
section: features
platform: []
feature:
  - analytics
order: 60
lastReviewed: '2026-10-29'
owner: docs
aliases:
  - analytics/setup.md
redirectFrom:
  - /docs/analytics/setup
---

# Product analytics setup

1. Enable **Analytics** in [Project settings](../getting-started/configuration.md).
2. Wire visitor consent. The browser SDK follows [CookieYes, Cookiebot, and Google Consent Mode](consent.md) on its own. Any other banner calls `optIn` / `optOut`. A page with no banner can set `publicAnalytics` where that is appropriate.
3. Send events from the SDK (`track`, `page`, `screen`, `identify`) — see each SDK guide. The API key decides the environment. SDKs do not send it.

Flutter: with analytics enabled, `TalariaNavigatorObserver` emits `$screen`, and you can call `Talaria.analytics.track`. There is no click autocapture.

Heatmaps need analytics enabled plus the heatmap switch, and the same consent model.
