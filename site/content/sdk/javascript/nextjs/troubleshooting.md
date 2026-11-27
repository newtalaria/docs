---
title: Next.js troubleshooting
description: What to check when Next.js events do not appear.
section: sdk
order: 48
---

- Use disjoint client and server entrypoints so Node `http` is not bundled into the client. See [Next.js](/sdk/javascript/nextjs/).
- Confirm a publishable key in the client entrypoint and a secret key only on the server.
- Look for a single disable warning (at most the first eight characters of the key).
- Leave `url` unset on Talaria Cloud unless the cell is `self`.
- Check the environment implied by the key.
- See [Fail-safe](/get-started/fail-safe/) and [JavaScript troubleshooting](/sdk/javascript/troubleshooting/).
