---
title: React
description: Install @newtalaria/react 0.6.1, with an ErrorBoundary and React 19 error hooks.
section: sdk
order: 30
---

`@newtalaria/react` **0.6.1** re-exports [`@newtalaria/browser`](/sdk/javascript/) and adds an `ErrorBoundary`, React 19 error hooks, a `Profiler`, and optional React Router instrumentation.

Building Next.js? Install [`@newtalaria/nextjs`](/sdk/javascript/nextjs/) instead.

```bash
npm install @newtalaria/react
```

```tsx
import { createRoot } from 'react-dom/client';
import { Talaria, ErrorBoundary, reactErrorHandler } from '@newtalaria/react';

Talaria.init({
  apiKey: 'tal_pk_prod_nz1_…',
});

const root = createRoot(document.getElementById('root')!, {
  onUncaughtError: reactErrorHandler(),
});

root.render(
  <ErrorBoundary fallback={<p>Something went wrong.</p>}>
    <App />
  </ErrorBoundary>,
);
```

The API key decides the environment. See [configuration](/sdk/javascript/react/configuration/), [errors](/sdk/javascript/react/errors/), and [tracing](/sdk/javascript/react/tracing/).
