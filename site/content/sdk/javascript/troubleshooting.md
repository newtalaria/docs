---
title: JavaScript troubleshooting
description: What to check when browser events do not appear.
section: sdk
order: 24
---

- Confirm a **publishable** `tal_pk_…` key in the browser. A secret key must not be in client code.
- Look for a single disable warning (at most the first eight characters of the key).
- Leave `url` unset on Talaria Cloud unless the cell is `self`.
- Check the environment implied by the key (a `dev` key will not show under production filters).
- Ad blockers can stop ingest; try a clean profile.
- Next.js: use disjoint client and server entrypoints so Node `http` is not bundled into the client. See [Next.js](/sdk/javascript/nextjs/).
