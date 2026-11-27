---
title: Serverpod errors
description: Diagnostic capture and fail-safe init.
section: sdk
order: 82
---

Pass `TalariaServerpod.handleExceptionEvent` as a diagnostic event handler. Uncaught diagnostics become one event per throw, isolated per session. `TalariaServerpod.init` never throws; with a disabled client, diagnostic and database hooks pass through. You can also call `Talaria.captureException`. See [fail-safe](/get-started/fail-safe/).
