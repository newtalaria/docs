---
title: Flutter troubleshooting
description: What to check when Flutter events do not appear.
section: sdk
order: 75
---

- Confirm `--dart-define=TALARIA_BROWSER_API_KEY` is a `tal_pk_…` key. A secret or monitor token disables Talaria.
- Look for one `[Talaria] Talaria is disabled: …` warning (at most eight characters of the key).
- Check `Talaria.isEnabled` / `client.disabledReason`.
- Leave `url` unset on Talaria Cloud unless the cell is `self`.
- Filter the dashboard by the environment implied by the key.
- Upload debug symbols or source maps with `talaria sourcemaps upload` if frames stay minified.
