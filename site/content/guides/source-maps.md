---
title: Source maps
description: Upload JavaScript source maps and Dart or Flutter debug symbols so issues show original frames.
section: guides
order: 140
---

Source maps and debug symbols belong to a [release](/guides/releases/). Upload them with a secret key that has `releases:write`. The ingest host is `https://ingest-nz1.newtalaria.com` (or `https://ingest-<cell>.newtalaria.com`).

## JavaScript

The Next.js plugin can create the release and upload `.next/static` maps during `next build` when `TALARIA_RELEASE_KEY` is set. A failed upload never fails the build. To upload at deploy time instead, disable the plugin upload and run `npx talaria-nextjs upload`. See [Next.js](/sdk/javascript/nextjs/).

For other JavaScript builds, use the npm CLI:

```bash
npx talaria source-maps upload \
  --release "$TALARIA_RELEASE" \
  --directory ./dist
```

`@newtalaria/cli` is the package behind `npx talaria`. The Go CLI from [get.newtalaria.com/cli](https://get.newtalaria.com/cli) uses a different command: `talaria sourcemaps upload`.

The API body is plain JSON, not an `input` wrapper:

```json
{
  "release": "main@a1b2c3d",
  "fileName": "_next/static/chunks/app.js",
  "gzipBytes": "<base64 gzip of the map>",
  "debugId": "optional-debug-id"
}
```

`POST /v1/source-maps` limits are 2 MiB for the gzip payload and 4 MiB for the JSON body. See the [Ingest API](/reference/ingest-api/).

Release names cannot contain `/`. Replace slashes in a git ref with `-` before you upload.

There is no published `newtalaria/release` GitHub Action. Call the CLI from your existing workflow.

## Dart and Flutter symbols

Upload debug symbols with the Go CLI:

```bash
talaria sourcemaps upload \
  --release "$TALARIA_RELEASE" \
  --directory ./build
```

Symbol uploads allow a 16 MiB gzip payload and a 32 MiB JSON body. MCP can read original frames with `get_source_context` (not a source-map file tool).

## Related

- [Releases](/guides/releases/)
- [CI](/deploy/ci/)
- [CLI](/cli/)
