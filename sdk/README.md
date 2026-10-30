---
title: Platforms
description: >-
  Official Talaria SDKs for Flutter, Dart, Serverpod, JavaScript, React,
  Next.js, Node.js, PHP, Laravel, and Silverstripe.
tags:
  - sdk
id: sdk
navTitle: Choose SDK
type: hub
section: platforms
platform: []
feature: []
order: 10
lastReviewed: '2026-10-30'
owner: docs
---

# SDKs

Official guides for install, configure, and capture.

| Stack | Package | Version | Key | Hub |
| ----- | ------- | ------- | --- | --- |
| Flutter | `talaria_flutter` | 0.3.0 | `tal_pk_` | [sdk/flutter](flutter/README.md) |
| Dart | `talaria` | 0.4.0 | `tal_pk_` (client) or `tal_sk_` (server) | [sdk/dart](dart/README.md) |
| Serverpod | `talaria_serverpod` | 0.3.0 | `tal_sk_` | [sdk/serverpod](serverpod/README.md) |
| JavaScript | `@newtalaria/browser` | 0.6.0 | `tal_pk_` | [sdk/javascript](javascript/README.md) |
| React | `@newtalaria/react` | 0.6.0 | `tal_pk_` | [sdk/react](react/README.md) |
| Next.js | `@newtalaria/nextjs` | 0.6.0 | `tal_sk_` server, `tal_pk_` browser | [sdk/nextjs](nextjs/README.md) |
| Node.js | `@newtalaria/node` | 0.6.0 | `tal_sk_` | [sdk/node](node/README.md) |
| PHP | `talaria/talaria` | 3.0.0 | `tal_sk_` | [sdk/php](php/README.md) |
| Laravel | `talaria/laravel` | 3.0.0 | `tal_sk_` server, `tal_pk_` browser | [sdk/laravel](laravel/README.md) |
| Silverstripe | `talaria/silverstripe` | 3.0.0 | `tal_sk_` server, `tal_pk_` browser | [sdk/silverstripe](silverstripe/README.md) |

`@newtalaria/cli` 0.6.0 uploads JavaScript source maps with a `tal_sk_` release key. You do not install `@newtalaria/core` yourself.

## Keys and ingest host

- A secret key `tal_sk_<env>_<cell>_…` is server-only. A publishable key `tal_pk_<env>_<cell>_…` is the only key that goes in a browser or mobile bundle. `<env>` is `prod`, `stg`, `test`, or `dev`, and the key decides the environment.
- `releases:write`, `flags:read`, and `monitors:write` need a secret key. Monitor tokens are `tal_mon_<cell>_…` and only check in.
- The ingest host comes from the key's cell: `https://ingest-<cell>.newtalaria.com`. `TALARIA_URL` (or the `url` option) is the only override, for self-host or a custom domain.
- Full-stack integrations take both keys. Laravel and Silverstripe read `TALARIA_API_KEY` (`tal_sk_`) on the server and `TALARIA_BROWSER_API_KEY` (config `browser_api_key`, must be `tal_pk_`) for the injected browser script. Next.js reads `TALARIA_API_KEY` on the server and `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY` in the browser. Flutter with Serverpod uses `--dart-define=TALARIA_BROWSER_API_KEY` (`tal_pk_`) in the app and `TALARIA_API_KEY` (`tal_sk_`) on the server. The secret key is never injected into the page.

Each guide opens with a quick setup and a short map of what that package can do. The next pages in the same folder are the instrumentation guide, errors and logs, and best practices.

JavaScript, React, and Next.js source maps: [Upload JavaScript source maps](../guides/upload-javascript-source-maps.md).

Agents: filter `search_docs` / `list_docs` with an `sdk` value matching the table. After the hub, `get_doc` `sdk/<id>/errors` and `sdk/<id>/tracing`. Search `analytics` or `feature flags` for [configuration](javascript/configuration.md) on that sdk.
