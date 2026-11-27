---
title: Node.js troubleshooting
description: What to check when Node.js events do not appear.
section: sdk
order: 58
---

- Confirm a **secret** `tal_sk_<env>_<cell>_…` key on the server. Never put that key in a client bundle.
- Look for a single disable warning (at most the first eight characters of the key).
- Leave `url` / `TALARIA_URL` unset on Talaria Cloud unless the cell is `self`.
- Check the environment implied by the key.
- Run `talaria verify`, then see [Fail-safe](/get-started/fail-safe/).
