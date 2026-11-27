---
title: React fail-safe
description: What React does when the key is missing or the wrong kind.
section: sdk
order: 37
---

In the browser, a missing, malformed, or secret key **disables** Talaria instead of throwing. Calls become no-ops and at most one warning is logged (first eight characters of the key only). See [Fail-safe](/get-started/fail-safe/).

Related: [React](/sdk/javascript/react/), [React configuration](/sdk/javascript/react/configuration/).
