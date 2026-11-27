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

## Initialise

```ts
import { Talaria } from '@newtalaria/browser';

Talaria.init({
  apiKey: 'tal_pk_prod_nz1_…',
  release: '1.4.2',
  minLevel: 'warning',
});
```

Use a **publishable** key in the browser. The API key decides the environment. Tracing, analytics, heatmaps, and session replay follow [project settings](/get-started/project-settings/). Leave `url` unset on Talaria Cloud.

## Verify

```ts
Talaria.captureException(new Error('Talaria test error'));
```

Run this once, then open **Issues** in the [dashboard](https://one.newtalaria.com). The test error shows as a new issue in the key's environment. Nothing there? See [troubleshooting](/sdk/javascript/troubleshooting/).

## Next

See [fail-safe](/get-started/fail-safe/), [configuration](/sdk/javascript/configuration/), [errors](/sdk/javascript/errors/), and [tracing](/sdk/javascript/tracing/).
