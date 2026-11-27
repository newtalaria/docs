---
title: React configuration
description: Init and error-handler wiring for @newtalaria/react.
section: sdk
order: 31
---

Call `Talaria.init` once with a publishable key, the same way as the [browser SDK](/sdk/javascript/configuration/). Then wrap the tree in `ErrorBoundary` and pass `reactErrorHandler()` to `createRoot`'s `onUncaughtError` on React 19.

Tracing and analytics follow project settings. Leave `url` unset on Talaria Cloud.
