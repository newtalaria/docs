---
title: Flutter errors
description: Zone bootstrap and error hooks from TalariaFlutter.runZonedApp.
section: sdk
order: 72
---

`TalariaFlutter.runZonedApp` installs error hooks inside the zone. A refused or missing key disables Talaria and **does not** install those hooks, so the app still runs. You can also call `Talaria.captureException` and `Talaria.captureMessage` from the re-exported core API. See [fail-safe](/get-started/fail-safe/).
