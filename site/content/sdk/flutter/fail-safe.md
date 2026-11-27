---
title: Flutter fail-safe
description: What Flutter does when the key is missing or the wrong kind.
section: sdk
order: 79
---

Flutter init accepts only a publishable `tal_pk_…` key (from `--dart-define=TALARIA_BROWSER_API_KEY`). A `tal_sk_` or `tal_mon_` key disables Talaria, does not install error hooks, and the app keeps running. See [Fail-safe](/get-started/fail-safe/).

Related: [Flutter](/sdk/flutter/), [Flutter configuration](/sdk/flutter/configuration/).
