---
title: JavaScript configuration
description: Init options for @newtalaria/browser. Project settings control tracing and analytics.
section: sdk
order: 21
---

`Talaria.init` takes a publishable `apiKey`, optional `release`, and optional `minLevel`. Leave `url` unset on Talaria Cloud; the SDK sends to `https://ingest-<cell>.newtalaria.com` from the key.

Remote config (`GET /v1/sdk-config`) applies project policy for tracing, analytics, replay, and sample rates. Do not pass `environment` in init.

Requests use `Authorization: Bearer`. A disabled client (bad key, wrong kind) is a no-op — see [fail-safe](/get-started/fail-safe/).

Related: [JavaScript](/sdk/javascript/), [Next.js source maps](/sdk/javascript/nextjs/).
