---
title: Silverstripe errors
description: Monolog and exception capture through the Silverstripe adapter.
section: sdk
order: 112
---

The adapter wires Monolog and reports exceptions after flush. A missing or bad key disables Talaria and must not take the site down. You can also call `Talaria::captureException`. See [fail-safe](/get-started/fail-safe/).
