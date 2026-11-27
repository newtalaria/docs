---
title: Next.js errors
description: captureRequestError, global-error, Server Actions, and Route Handlers.
section: sdk
order: 42
---

Export `captureRequestError` as `onRequestError` from `instrumentation.ts`. Pair it with a `global-error.tsx` and with `Talaria.captureException` (or the client `ErrorBoundary`) in user space. Examples for a Server Action and a Route Handler are in `examples/next/` of the JS SDK repository.

A missing or invalid key disables Talaria on that runtime; it must not fail the request. See [fail-safe](/get-started/fail-safe/).
