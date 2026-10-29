---
title: JavaScript instrumentation and tracing
description: >-
  Automatic pageload, history, fetch/XHR, and web vital spans in
  @newtalaria/browser, plus manual spans and W3C traceparent.
package: '@newtalaria/browser'
tags:
  - javascript
  - instrumentation
  - tracing
  - spans
  - http
  - vitals
id: javascript-tracing
navTitle: Tracing
type: guide
section: platforms
platform:
  - javascript
feature: []
order: 30
lastReviewed: '2026-10-29'
owner: docs
---
# JavaScript instrumentation and tracing

## What you're setting up

Turn **Tracing** on in [Project settings](../../get-started/project-settings.md). Until the SDK fetches and applies project configuration, the page records errors and does not open spans. Successful transactions follow the traces sample rate. Error transactions are always sent.

Talaria uses the OpenTelemetry span model (a trace of spans with a span kind) and W3C Trace Context (`traceparent`) on outbound HTTP.

## Steps

### 1. Pageload

After init, the SDK opens a pageload transaction for the document. It finishes on idle (about two seconds after the last activity, capped at 30 seconds). The transaction measures route work. It does not stay open for the whole visit.

### 2. Navigation

History `pushState` / `replaceState` starts a new transaction and a new trace id for that pathname. Call `startNavigation` when the app changes the view without going through History:

```javascript
Talaria.startNavigation({
  name: location.pathname,
  url: location.href,
});
```

### 3. Fetch and XHR

With tracing on, `fetch` and XHR to the same origin, and to origins listed in `networkErrorOrigins`, become CLIENT spans. The SDK sets `traceparent` on those requests so a backend that reads W3C Trace Context can continue the trace.

```javascript
Talaria.init({
  apiKey: 'tal_pk_prod_nz1_…',
  release: '1.4.2',
  networkErrorOrigins: ['https://api.example.com'],
});
```

Same-origin is always eligible. Ingest URLs are skipped. Do not wrap Talaria's own transport.

Failed requests to those origins can also become events (`captureFailedRequests`, default on). The default status range is 500–599.

### 4. Web Vitals

LCP, INP, CLS, and TTFB are recorded as child spans named `browser.web_vital` on the document pageload. A vital that arrives after the pageload has ended is still attached to that pageload. An unsampled pageload emits no vital spans.

### 5. Manual spans

```javascript
const span = Talaria.startSpan('checkout.charge', {
  kind: 'internal',
  attributes: { 'app.step': 'charge' },
});
try {
  await charge();
  span?.setStatus('ok');
} catch (error) {
  span?.setStatus('error', error instanceof Error ? error.message : String(error));
  throw error;
} finally {
  span?.end();
}
```

`startInactiveSpan` records a span that does not become the current parent. Use it for a measurement that should not wrap later HTTP calls.

### 6. Sampling

The traces sample rate in Project settings applies to successful transactions. A transaction that errors is kept. Child spans are stored with the sampled root.

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [JavaScript SDK](README.md)
- [Errors, logs, and breadcrumbs](errors.md)
- [Best practices](configuration.md)
- [Configuration](../../get-started/project-settings.md)
