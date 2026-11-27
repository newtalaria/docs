---
title: JavaScript errors
description: Capture exceptions and messages with @newtalaria/browser.
section: sdk
order: 22
---

```ts
import { Talaria } from '@newtalaria/browser';

await Talaria.captureException(error);
await Talaria.captureMessage('something happened', 'warning');
```

Unhandled errors are collected after `init`. `minLevel` drops quieter messages. A disabled client ignores calls and does not throw.

For React error boundaries, use [`@newtalaria/react`](/sdk/javascript/react/). For App Router `global-error` and Server Actions, use [`@newtalaria/nextjs`](/sdk/javascript/nextjs/).
