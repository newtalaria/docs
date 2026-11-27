---
title: JavaScript SDK
description: Install @newtalaria/browser and capture errors, logs, and traces from a web app.
section: sdk
order: 20
---

`@newtalaria/browser` (0.6.0) is the browser SDK. Use it in a plain web app. React, Next.js, and Node have their own guides, which will live under this platform once rewritten.

## Install and init

Init once, before the rest of the app runs. Use a **publishable** key only:

```bash
npm install @newtalaria/browser
```

```javascript
import { Talaria } from "@newtalaria/browser";

Talaria.init({
  key: "tal_pk_…",
});
```

Leave `TALARIA_URL` unset on Talaria Cloud. The SDK derives the ingest host from the key, and the key decides the environment. Do not pass `environment` in init. Send `release` as `<ref>@<shortsha>` (for example `main@a8f31c2`).

## What you get

- Errors, logs, breadcrumbs, user, tags, and release
- Pageload, navigation, fetch/XHR, web vitals, and manual spans (when tracing is on in Project settings)
- Analytics, feature flags, session replay, heatmaps, and consent — also from Project settings; until those are on, the page sends errors only

Confirm the first event in **Issues**, or with MCP `search_issues` and `environment: development`.
