---
title: React errors
description: ErrorBoundary and captureException in a React tree.
section: sdk
order: 32
---

`ErrorBoundary` catches render errors in the subtree and can render a fallback. `reactErrorHandler()` reports uncaught errors from `createRoot`. You can still call `Talaria.captureException` and `Talaria.captureMessage` yourself.

A disabled client (bad or missing key) does not throw and does not install hooks that break the app. See [fail-safe](/get-started/fail-safe/).
