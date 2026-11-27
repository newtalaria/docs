---
title: Laravel troubleshooting
description: What to check when Laravel events do not appear.
section: sdk
order: 108
---

- Confirm the key kind matches the surface (secret on the server when you need releases or monitors).
- Look for a single disable warning (at most the first eight characters of the key).
- Leave `TALARIA_URL` unset on Talaria Cloud unless the cell is `self`.
- Check the environment implied by the key.
- Run `talaria verify`, then see [Fail-safe](/get-started/fail-safe/).
