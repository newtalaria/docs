---
title: Upload JavaScript source maps
description: Walk through a local or CI upload so a minified browser stack shows the original file.
tags: [javascript, source-maps, release, cli, guide]
---

# Upload JavaScript source maps

Opening an event rewrites a minified JavaScript frame to the original file, line, column, and function when a source map for that release and bundle is stored. The browser reports the minified basename, such as `main.a1b2c3.js`. Upload the built `*.js.map` under that name, for the same release the app sends.

Hidden source maps work. Talaria reads the copy you upload when the event is opened.

Browser, React, and Next.js share this path. The upload command is `@newtalaria/cli` (`talaria sourcemaps upload`).

## 1. Send a release from the app

The release on the event and the release on the upload are the same string.

```js
Talaria.init({
  dsn: 'https://ingest.newtalaria.com',
  apiKey: process.env.NEXT_PUBLIC_TALARIA_API_KEY,
  release: process.env.NEXT_PUBLIC_TALARIA_RELEASE,
})
```

Local development uses the stable release `local`. A deploy uses `<ref>@<shortsha>`, the same string as the event. See [Releases](releases.md). The SDK reads `release` only from init.

The value in `apiKey` is the ingest key. The upload uses a second key, below.

For Next.js, run the upload after `next build`. `withTalariaConfig` configures the app. The CLI uploads the maps from the build output.

## 2. Create an upload key

In the dashboard, create an API key and enable **Allow creating releases (`releases:write`)**. That scope registers a release and calls `sourceMaps.upload`. Leave it off the browser key.

Put the raw key in `TALARIA_RELEASE_KEY`. Keep it out of git and out of any `NEXT_PUBLIC_` or other client env var.

An agent mints that key only after you agree:

`create_api_key` with `scopes: ["releases:write"]` and a name such as `source maps`.

Omitting `scopes` still mints the ingest key. `setup_project` keeps minting the development ingest key and does not add `releases:write`.

## 3. Upload a local build

The local API listens on port 8080 (`http://localhost:8080`). A local MCP server listens on port 8082 and is a different service from the upload URL.

```sh
export TALARIA_RELEASE_KEY=tal_live_…
export TALARIA_RELEASE=local

npx talaria sourcemaps upload ./dist
```

`TALARIA_RELEASE=local` matches `Talaria.init({ release: 'local' })`.

Until `@newtalaria/cli` is on npm, build the workspace package and run it from this repository:

```sh
node sdks/javascript/browser/packages/cli/dist/bin.js sourcemaps upload ./dist
```

The command prints the URL, the release, and each `fileName`, then the stored id. A failing file, a missing key, or a directory with no `*.js.map` exits non-zero.

| Setting | Flag | Environment | Default |
| ------- | ---- | ----------- | ------- |
| Directory | positional | | `.` |
| API URL | `--url` | `TALARIA_BASE_URL` | `http://localhost:8080` |
| Release | `--release` | `TALARIA_RELEASE` | `local` |
| Key | `--api-key` | `TALARIA_RELEASE_KEY`, then `TALARIA_API_KEY` | required |

## 4. Upload from CI

Pass the API, the key, and the release on the command. The upload string is the same `TALARIA_RELEASE` the app was built with. The [releases guide](releases.md) has the GitHub Actions workflow.

```sh
export TALARIA_RELEASE="${GITHUB_REF_NAME}@${GITHUB_SHA::7}"
export TALARIA_COMMIT_SHA="${GITHUB_SHA}"
npx talaria sourcemaps upload \
  --url "$TALARIA_BASE_URL" \
  --api-key "$TALARIA_RELEASE_KEY" \
  --release "$TALARIA_RELEASE" \
  ./dist
```

Hosted API base URL: `https://ingest.newtalaria.com`.

## 5. Confirm the original frame

Open the event in the dashboard, or call `get_event`. A matching frame shows the original path, function, line, and a short context window.

For a wider excerpt, call MCP `get_source_map` (dashboard AI uses `getSourceMaps`) with:

- `eventId`
- `frameIndex` — oldest to newest on the stored stack
- `contextLines` — optional, default 20, at most 40

The result includes `path`, `line`, `column`, `functionName`, `contextLine`, `preContext`, and `postContext`.

When `mapped` is false, `release` and `fileName` are the pair still to upload. Upload that basename for the event's release, then open the event again.

A frame that is still a hashed `*.js` name means that pair is missing.

The stored event and the issue fingerprint stay as captured. The rewrite happens when the event is read.

## What the command sends

It walks the directory for `*.js.map`, skipping `node_modules` and `.git`. Other maps, such as `styles.css.map`, are left in place.

`fileName` is the map basename with `.map` removed. `dist/assets/main.a1b2c3.js.map` uploads as `main.a1b2c3.js`, which is the name the browser reports. Bundlers often set the map's `file` field to `main.js`. The CLI uses the filename on disk.

A name outside `^[A-Za-z0-9._~+-]+$`, or longer than 200 characters, fails before the request.

The body is gzip of the raw JSON, including `sourcesContent`. A string `debugId` in that JSON is stored on the artifact. Lookup uses the release and `fileName`.

Uploading the same release and `fileName` again replaces that map. One request per file.

Limits: source map version 3, at most 2 MiB gzipped and 4 MiB of JSON.

```json
POST {baseUrl}/sourceMaps/upload
X-API-Key: tal_live_…

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

## Related

- [JavaScript source maps](../sdk/javascript/source-maps.md)
- [JavaScript SDK](../sdk/javascript/README.md)
- [React SDK](../sdk/react/README.md)
- [Next.js SDK](../sdk/nextjs/README.md)
- [Add Talaria with an agent](add-talaria-with-an-agent.md)
- [API overview](../api/overview.md)
