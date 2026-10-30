---
title: Upload JavaScript source maps
description: >-
  Upload minified bundle source maps in local dev and CI so stack frames show
  original files and line numbers.
package: "@newtalaria/cli"
tags:
  - javascript
  - source-maps
  - release
  - cli
  - guide
id: upload-javascript-source-maps
navTitle: Upload source maps
type: guide
section: guides
platform:
  - javascript
  - react
  - nextjs
feature:
  - issues
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# Upload JavaScript source maps

## What you're setting up

Opening an event rewrites a minified JavaScript frame to the original file, line, column, and function. Talaria matches a debug id first, when the event and an uploaded map share one. Otherwise it matches the release plus the served artifact path, such as `assets/app.js` or `main.a1b2c3.js`. A stored name with no slash still matches that basename.

Hidden source maps work. Talaria reads the copy you upload when the event is opened.

## Why use this

Browser, React, and Next.js share this path. The upload command is `@newtalaria/cli` (`talaria source-maps upload` or `npx talaria source-maps upload`). A minified stack stays minified until maps are uploaded for the same release.

## Before you start

The release on the event and the release on the upload are the same string. The value in `apiKey` is the publishable key. The upload uses a release key with `releases:write`.

For Next.js, run the upload after `next build`. `withTalariaConfig` configures the app. The CLI uploads the maps from the build output.

## Steps

### 1. Send a release from the app

```js
Talaria.init({
  apiKey: process.env.NEXT_PUBLIC_TALARIA_BROWSER_API_KEY,
  release: process.env.NEXT_PUBLIC_TALARIA_RELEASE,
})
```

Local development uses the stable release `local`. A deploy uses `<ref>@<shortsha>`, the same string as the event. See [Releases](../features/releases.md). The SDK reads `release` only from init.

### 2. Create an upload key

In the dashboard, create an API key and enable **Allow creating releases (`releases:write`)**. That scope registers a release and calls `POST /v1/source-maps`. Leave it off the publishable key.

Put the raw key in `TALARIA_RELEASE_KEY`. Keep it out of git and out of any `NEXT_PUBLIC_` or other client env var.

An agent mints that key only after you agree:

`create_api_key` with `scopes: ["releases:write"]` and a name such as `source maps`.

Omitting `scopes` still mints the publishable key, with every publishable scope. `setup_project` keeps minting the development publishable key and does not add `releases:write`.

### 3. Upload a local build

Leave `TALARIA_URL` and `--url` unset on Talaria Cloud. Set them only for self-host or a custom domain. The hosted API base URL is `https://ingest-nz1.newtalaria.com`.

```sh
export TALARIA_RELEASE_KEY=tal_sk_prod_nz1_…
export TALARIA_RELEASE=local

npx talaria source-maps upload ./dist
```

`TALARIA_RELEASE=local` matches `Talaria.init({ release: 'local' })`.

The command prints the URL, the release, and each `fileName`, then the stored id. A failing file, a missing key, or a directory with no `*.js.map` exits non-zero.

| Setting | Flag | Environment | Default |
| ------- | ---- | ----------- | ------- |
| Directory | positional | | `.` |
| API URL | `--url` | `TALARIA_URL` | unset on Talaria Cloud |
| Release | `--release` | `TALARIA_RELEASE` | `local` |
| Key | `--api-key` | `TALARIA_RELEASE_KEY` | required |
| Silverstripe combine | `--silverstripe-combine-files` | | off |

### 4. Upload from CI

On GitHub Actions, upload the directory the build already wrote. Keep `TALARIA_RELEASE_KEY` in the environment. When `TALARIA_RELEASE` is set, the action uses that string, so the maps match the app build. The [releases guide](../features/releases.md) shows the release step next to the build.

```yaml
- uses: newtalaria/release@v1  # Illustrative until newtalaria/release@v1 is published
  id: release
  with:
    source-maps: dist
  env:
    TALARIA_RELEASE_KEY: ${{ secrets.TALARIA_RELEASE_KEY }}
```

`steps.release.outputs.release` is the release sent with each map.

### 5. What the command sends

It walks the directory for `*.js.map`, skipping `node_modules` and `.git`. Other maps, such as `styles.css.map`, are left in place.

When a `.js` file sits beside a `.js.map`, the command writes one debug id into both files and uploads the JavaScript path relative to the directory. `dist/assets/app.js.map` uploads as `assets/app.js`. Deploy those rewritten `.js` files. The browser SDK sends the id from `globalThis.__talariaDebugIds`, which that snippet fills from `document.currentScript` or the stack URL. A map with no sibling uploads as its basename. A path segment outside `^[A-Za-z0-9._~+-]+$`, a `..` segment, or a name longer than 200 characters fails before the request.

The body is gzip of the source map JSON, including `sourcesContent`. The debug id is stored on the artifact. Lookup uses that id, then the release and `fileName`.

Uploading the same release and `fileName` again replaces that map. One request per file.

Limits: source map version 3, at most 2 MiB gzipped and 4 MiB of JSON.

```json
POST {url}/v1/source-maps
Authorization: Bearer tal_sk_prod_nz1_…

{
  "input": {
    "__className__": "UploadSourceMapInput",
    "release": "local",
    "fileName": "main.a1b2c3.js",
    "gzipBytes": "decode('<base64 of the gzip bytes>', 'base64')"
  }
}
```

`UploadSourceMapResponse` returns `id`, `release`, `fileName`, and `sizeBytes` (uncompressed JSON length).

### 6. Silverstripe combined JavaScript

`Requirements::combine_files` writes one header line, then the first file:

```
/****** FILE: themes/default/javascript/scripts.js *****/
```

Files later in that same call sit after this one, so their bytes do not move its lines. The uploaded script is that first path.

`--silverstripe-combine-files` writes the debug id into the sibling `.js` and uploads the map with one empty generated line in front, matching the header. Deploy the rewritten `.js` as the file the combiner reads. The page still serves `assets/_combinedfiles/scripts-<hash>.js`. That combined script contains the debug id, and the browser reports its URL. Talaria matches the debug id and reads the line from the shifted map.

```sh
npx talaria source-maps upload ./source-maps --silverstripe-combine-files
```

On GitHub Actions (illustrative until `newtalaria/release@v1` is published):

```yaml
- uses: newtalaria/release@v1
  with:
    source-maps: source-maps
```

`Talaria.init({ release })` stays the release the action prints. A script the browser loads directly is uploaded without this flag.

## Check it worked

Open the event in the dashboard, or call `get_issue`. A matching frame shows the original path, function, line, and a short context window.

For a wider excerpt, call MCP `get_source_map` (dashboard AI uses `getSourceMaps`) with:

- `eventId`
- `frameIndex` — oldest to newest on the stored stack
- `contextLines` — optional, default 20, at most 40

The result includes `path`, `line`, `column`, `functionName`, `contextLine`, `preContext`, and `postContext`.

The stored event and the issue fingerprint stay as captured. The rewrite happens when the event is read.

## Troubleshooting

### A frame is still a hashed JavaScript file

**Cause:** When `mapped` is false, `release` and `fileName` are the pair still to upload. A frame that is still a hashed `*.js` name means that pair is missing. The hash is the artifact name. Talaria does not treat it as another file.

**Fix:** Upload that artifact for the event's release, or upload a map with the same debug id, then open the event again.

## Next steps

- [JavaScript SDK](../sdk/javascript/README.md)
- [React SDK](../sdk/react/README.md)
- [Next.js SDK](../sdk/nextjs/README.md)
- [Add Talaria with an agent](../agents/add-talaria.md)
- [API overview](../reference/ingest-api.md)
