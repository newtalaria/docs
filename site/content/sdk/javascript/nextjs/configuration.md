---
title: Next.js configuration
description: Client and server init, withTalariaConfig, and environment variables.
section: sdk
order: 41
---

- Browser: `initClient` in `instrumentation-client.ts` with `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY` (`tal_pk_…` only).
- Server: `initServer` in a file imported only from the Node `register()` branch, with `TALARIA_API_KEY` (`tal_sk_…`).
- `withTalariaConfig` wraps `next.config`. It tags the release and can upload maps when `TALARIA_RELEASE_KEY` is set.
- Leave `TALARIA_URL` / `NEXT_PUBLIC_TALARIA_URL` unset on Talaria Cloud.

See the [Next.js hub](/sdk/javascript/nextjs/).
