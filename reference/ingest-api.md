---
title: Ingest API reference
path: reference/ingest-api.md
description: >-
  Ingest authentication, event shape, and how the API key sets environment and
  release.
tags:
  - api
  - ingest
id: ingest-api
navTitle: Ingest API
type: reference
section: reference
platform: []
feature: []
apiVersion: ingest-v1
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# API overview

Prefer an official SDK. When integrating raw HTTP:

## Auth

Send the project ingest key as `X-API-Key` or `Authorization: Bearer <key>`. Key prefixes are environment-specific: `tal_prod_` (production), `tal_stg_` (staging), `tal_test_` (test), `tal_dev_` (development).

## Base URL

Talaria Cloud: `https://ingest.newtalaria.com`.

## Environments and releases

Every API key is bound to exactly one environment: development, test, staging, or production. The key prefix identifies the environment: `tal_prod_`, `tal_stg_`, `tal_test_`, or `tal_dev_`. The server stamps that environment onto events, spans, analytics, replays, and heatmaps. SDKs do not send environment. Ingest endpoints do not accept it.

A deployed app that should report production needs a production key (`tal_prod_`). MCP `setup_project` and other local agent installs use a development key (`tal_dev_`). Production shipping is a second key.

Send `release` as a version or commit SHA. A local run still sends a version or SHA as release. JavaScript source-map upload uses that same string.

## Source maps

`POST /v1/source-maps` on the API base URL. Send `X-API-Key` from a key with `releases:write`. The browser ingest key stays on the ingest scopes.

The body is Serverpod `UploadSourceMapInput`: `release`, `fileName` (minified basename), optional `debugId`, and `gzipBytes` (the Serverpod `ByteData` string `decode('<base64 of the gzip bytes>', 'base64')`). `UploadSourceMapResponse` returns `id`, `release`, `fileName`, and `sizeBytes`.

The local and CI walkthrough is [Upload JavaScript source maps](../guides/upload-javascript-source-maps.md).

Issues stay separate per environment because the fingerprint includes environment. Each issue stores that environment. A sibling key links the same failure across environments, and issue detail lists those other environments. Clients never send a fingerprint.

The dashboard reads one environment at a time: Production, Staging, Test, Development, or All. The shell defaults to production when the project has a production key, otherwise development. All is an explicit choice.

Alerts with no environment evaluate as production. An alert that should cover every environment names that scope explicitly.

Feature flags stay one definition per project. Evaluation uses the key's environment. Rules can target development, test, staging, or production.

Test, staging, and production use the plan meters, including pay-as-you-go. Development has its own included cap equal to that signal's plan inclusion, hard-stops, and does not create overage.

## Related

- [Quickstart](../getting-started/quickstart.md)
- [Configuration](../getting-started/configuration.md)
- [SDK hub](../sdk/README.md)
- [Upload JavaScript source maps](../guides/upload-javascript-source-maps.md)
