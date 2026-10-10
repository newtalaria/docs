---
title: JavaScript source maps
description: Upload minified bundle maps for a release so stack frames show original files.
sdk: javascript
package: "@newtalaria/cli"
tags: [javascript, source-maps, release, cli]
---

# JavaScript source maps

Talaria rewrites a minified JavaScript frame when the event is opened. The match is the event `release` plus the minified file name the browser reports, such as `main.a1b2c3.js`.

The step-by-step path for local development, CI, and agents is [Upload JavaScript source maps](../../guides/upload-javascript-source-maps.md).

## Package

```bash
npx talaria sourcemaps upload ./dist
```

`@newtalaria/cli` uploads `*.js.map` files. The browser, React, and Next.js packages send the release and the minified basename. They do not upload maps.

Until the CLI is published, from this repository:

```bash
node sdks/javascript/browser/packages/cli/dist/bin.js sourcemaps upload ./dist
```

## Release and key

```js
Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.NEXT_PUBLIC_TALARIA_API_KEY,
  release: process.env.NEXT_PUBLIC_TALARIA_RELEASE,
})
```

`apiKey` is the ingest key. Upload uses a second key with only `releases:write`, in `TALARIA_RELEASE_KEY`. Create it in the dashboard (**Allow creating releases**) or, after the user agrees, with MCP `create_api_key` and `scopes: ["releases:write"]`. Keep that key out of the browser bundle.

Local default release is `local`. CI passes the git SHA as `--release` and sets the same value on init.

## Local

API port 8080. Defaults are `http://localhost:8080` and release `local`.

```sh
export TALARIA_RELEASE_KEY=tal_live_…
export TALARIA_RELEASE=local

npx talaria sourcemaps upload ./dist
```

## CI

```sh
export TALARIA_RELEASE="$(git rev-parse HEAD)"
npx talaria sourcemaps upload \
  --url "$TALARIA_BASE_URL" \
  --api-key "$TALARIA_RELEASE_KEY" \
  --release "$TALARIA_RELEASE" \
  ./dist
```

Hosted API: `https://ingest.newtalaria.com`.

## Command

| Setting | Flag | Environment | Default |
| ------- | ---- | ----------- | ------- |
| Directory | positional | | `.` |
| API URL | `--url` | `TALARIA_BASE_URL` | `http://localhost:8080` |
| Release | `--release` | `TALARIA_RELEASE` | `local` |
| Key | `--api-key` | `TALARIA_RELEASE_KEY`, then `TALARIA_API_KEY` | required |
| Silverstripe combine | `--silverstripe-combine-files` | | off |

`main.a1b2c3.js.map` is sent as `fileName` `main.a1b2c3.js`. CSS maps are skipped. A basename outside `^[A-Za-z0-9._~+-]+$` fails locally. The same release and file name replaces the previous map. Caps are source map version 3, 2 MiB gzip, and 4 MiB JSON.

## Read the original file

`get_event` shows the rewritten frame. `get_source_map` (`eventId`, `frameIndex`, optional `contextLines` up to 40) returns a window of the original file. `mapped: false` includes the `fileName` still to upload.

## Related

- [Upload guide](../../guides/upload-javascript-source-maps.md)
- [JavaScript SDK](README.md)
- [React SDK](../react/README.md)
- [Next.js SDK](../nextjs/README.md)
- [API overview](../../api/overview.md)
