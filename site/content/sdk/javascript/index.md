---
title: JavaScript
description: Install @newtalaria/browser 0.6.1 and send a first browser event.
section: sdk
order: 20
---

`@newtalaria/browser` **0.6.1** is the official browser SDK. React, Next.js, and Node.js are [guides under this platform](/sdk/javascript/react/).

## Install

```bash
npm install @newtalaria/browser
```

```ts
import { Talaria } from '@newtalaria/browser';

Talaria.init({
  apiKey: 'tal_pk_prod_nz1_…',
  release: '1.4.2',
  minLevel: 'warning',
});
```

Use a **publishable** key in the browser. The API key decides the environment. Tracing, analytics, heatmaps, and session replay follow [project settings](/get-started/project-settings/). Leave `url` unset on Talaria Cloud.

## Capture

```ts
await Talaria.captureException(err);
await Talaria.captureMessage('checkout started', 'info');
```

A missing or invalid key disables Talaria instead of throwing. See [fail-safe](/get-started/fail-safe/), [configuration](/sdk/javascript/configuration/), [errors](/sdk/javascript/errors/), and [tracing](/sdk/javascript/tracing/).
