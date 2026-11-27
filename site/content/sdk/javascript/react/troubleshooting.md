---
title: React troubleshooting
description: What to check when React events do not appear.
section: sdk
order: 38
---

- Confirm a **publishable** `tal_pk_…` key in the browser (or the client entrypoint). A secret key must not be in client code.
- Look for a single disable warning (at most the first eight characters of the key).
- Leave `url` unset on Talaria Cloud unless the cell is `self`.
- Check the environment implied by the key (a `dev` key will not show under production filters).
- Ad blockers can stop ingest; try a clean profile.
- See [Fail-safe](/get-started/fail-safe/) and [JavaScript troubleshooting](/sdk/javascript/troubleshooting/).
