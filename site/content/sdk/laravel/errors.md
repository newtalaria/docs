---
title: Laravel errors
description: Exception reporting through the Laravel adapter.
section: sdk
order: 102
---

The adapter reports unhandled exceptions. You can still call `Talaria::captureException` and `Talaria::captureMessage`. A missing or malformed key disables the client and logs one warning; it must not take the app down. See [fail-safe](/get-started/fail-safe/).
