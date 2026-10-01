---
title: Product analytics setup
description: Enable analytics, then send track, page, screen, and identify events from any SDK.
tags: [analytics]
---

# Product analytics setup

1. Enable **Analytics** in [Project settings](../getting-started/configuration.md).
2. Wire visitor consent (`optIn` / `optOut`, or `publicAnalytics` where appropriate).
3. Send events from the SDK (`track`, `page`, `screen`, `identify`) — see each SDK guide. The API key decides the environment. SDKs do not send it.

Flutter: with analytics enabled, `TalariaNavigatorObserver` emits `$screen`, and you can call `Talaria.analytics.track`. There is no click autocapture.

Heatmaps need analytics enabled plus the heatmap switch, and the same consent model.
