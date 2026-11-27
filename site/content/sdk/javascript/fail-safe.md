---
title: JavaScript fail-safe
description: What JavaScript does when the key is missing or the wrong kind.
section: sdk
order: 28
---

In the browser, a missing, malformed, or secret key **disables** Talaria instead of throwing. Calls become no-ops and at most one warning is logged (first eight characters of the key only). See [Fail-safe](/get-started/fail-safe/).

Related: [JavaScript](/sdk/javascript/), [JavaScript configuration](/sdk/javascript/configuration/).
