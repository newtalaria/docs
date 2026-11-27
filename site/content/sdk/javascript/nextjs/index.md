---
title: Next.js
description: Install @newtalaria/nextjs 0.6.1 with disjoint client and server entrypoints.
section: sdk
order: 40
---

`@newtalaria/nextjs` **0.6.1** supports Next.js 14–16. Install this package only — it pulls React (client) and Node (server).

```bash
npm install @newtalaria/nextjs
```

Use **disjoint entrypoints** so the App Router never bundles Node `http` into the client:

```ts
// instrumentation-client.ts
import { initClient } from '@newtalaria/nextjs/client';

initClient({
  url: process.env.NEXT_PUBLIC_TALARIA_URL,
  apiKey: process.env.NEXT_PUBLIC_TALARIA_BROWSER_API_KEY!, // tal_pk_ only
});
```

```ts
// talaria.server.config.ts
import { initServer } from '@newtalaria/nextjs/server';

initServer({
  url: process.env.TALARIA_URL,
  apiKey: process.env.TALARIA_API_KEY!, // tal_sk_…
});
```

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./talaria.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./talaria.edge.config');
  }
}

export { captureRequestError as onRequestError } from '@newtalaria/nextjs/server';
```

```ts
// next.config.ts
import { withTalariaConfig } from '@newtalaria/nextjs/config';

export default withTalariaConfig({
  // your config
});
```

Leave `url` / `TALARIA_URL` unset on Talaria Cloud. The browser key must be `tal_pk_…`. The server key must be `tal_sk_…`. The API key decides the environment.

## Releases and source maps

`withTalariaConfig` does **not** upload source maps unless `TALARIA_RELEASE_KEY` is set (a secret key with `releases:write`, never a browser key). The release is `TALARIA_RELEASE`, or `<branch>@<sha7>` from well-known CI variables, inlined as `NEXT_PUBLIC_TALARIA_RELEASE` and `NEXT_PUBLIC_TALARIA_COMMIT_SHA`. Leave `release` out of `init`, or set it to the same value.

After `next build` compiles (Next 15.4+), the plugin can create the release (`POST /v1/releases`) and upload `.next/static` maps (`POST /v1/source-maps`) under `_next/static/…`, then delete the `.map` files. A failed upload never fails the build. To upload at deploy time instead, pass `{ uploadSourceMaps: false, hideSourceMaps: false }` and run `npx talaria-nextjs upload`.

See `examples/next/` in the [talaria-js-sdk](https://github.com/newtalaria/talaria-js-sdk) repo for `global-error.tsx`, a Server Action, and a Route Handler. More: [configuration](/sdk/javascript/nextjs/configuration/), [errors](/sdk/javascript/nextjs/errors/), [tracing](/sdk/javascript/nextjs/tracing/).
