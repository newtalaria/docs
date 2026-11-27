---
title: Dart troubleshooting
description: What to check when Dart events do not appear.
section: sdk
order: 68
---

- Confirm the key kind matches the surface (publishable on Flutter; secret on a Dart VM server when you need releases or monitors).
- Look for a single disable warning (at most the first eight characters of the key).
- Leave `url` unset on Talaria Cloud unless the cell is `self`.
- Check the environment implied by the key.
- Run `talaria verify`, then see [Fail-safe](/get-started/fail-safe/).
