---
title: React instrumentation and tracing
description: Browser pageload and fetch spans, React Profiler commit spans, and React Router navigation in @newtalaria/react.
sdk: react
package: "@newtalaria/react"
tags: [react, instrumentation, tracing, spans, http, profiler]
---

# React instrumentation and tracing

`@newtalaria/react` uses the same automatic browser tracing as [`@newtalaria/browser`](../javascript/instrumentation.md): pageload, History navigation, fetch/XHR CLIENT spans, W3C `traceparent` on allowlisted origins, and web vitals as child spans of the pageload. Turn **Tracing** on in [Project settings](../../getting-started/configuration.md). Successful transactions follow the traces sample rate. Error transactions are always sent.

## Profiler

`Profiler` records a React commit as an INTERNAL span named `ui.react.<id>` when tracing is on. The span carries `ui.component_name` and `ui.render.duration_ms`.

```tsx
import { Profiler } from '@newtalaria/react';

<Profiler id="Checkout">
  <Checkout />
</Profiler>
```

`withProfiler(Component, 'Checkout')` wraps a component the same way.

## React Router

`instrumentReactRouter` records v6/v7 navigations. `react-router` is a peer dependency. Call it once with the router you created:

```javascript
import { instrumentReactRouter } from '@newtalaria/react';

const unsubscribe = instrumentReactRouter(router);
```

The first location starts a navigation transaction. Each later location starts another, with that pathname as the name. Call `unsubscribe` if the router goes away.

## Manual spans

`Talaria.startSpan` and `Talaria.startNavigation` are the browser methods. Use a manual span for a multi-step action (submit, wizard) so it is not parented by the short pageload transaction after that transaction has ended.

## Related

- [React SDK](README.md)
- [Browser instrumentation](../javascript/instrumentation.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Configuration](../../getting-started/configuration.md)
