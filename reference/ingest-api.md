---
title: Ingest API reference
description: >-
  Routes, auth, and scopes for the Talaria ingest API on
  ingest-nz1.newtalaria.com.
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

# Ingest API

Prefer an official SDK. This page is the HTTP contract.

## Auth

Send `Authorization: Bearer` and one credential. Publishable keys are `tal_pk_<env>_nz1_…`. Secret keys are `tal_sk_<env>_nz1_…`. Monitor tokens are `tal_mon_nz1_…` and are valid only on `POST /v1/check-ins`.

`<env>` is `prod`, `stg`, `test`, or `dev`. Client SDKs (browser and Flutter) refuse a secret key or a monitor token at init. Server SDKs log one warning on a publishable key.

A new publishable key gets every publishable scope: `events:write`, `spans:write`, `logs:write`, `metrics:write`, `analytics:write`, `replays:write`, and `flags:evaluate`. A release key is a secret key. `releases:write` only is recommended for CI.

## Host

Ingest is `https://ingest-nz1.newtalaria.com`. OTLP is `https://ingest-nz1.newtalaria.com/otlp` (HTTP only; gRPC is not supported). `api.newtalaria.com` serves no `/v1` ingest and no `/otlp`. MCP stays at `https://api.newtalaria.com/mcp`.

If `TALARIA_URL` or `url` is set, the SDK uses it. Otherwise a `self` cell fails fast, and any other cell derives `https://ingest-<cell>.newtalaria.com`. Set `TALARIA_URL` only for self-host or a custom domain.

## Environments and releases

Each API key is bound to one environment. The server stamps it. SDKs do not send an environment. `setup_project` mints a development publishable key. Production is a second key.

Send `release` as `<ref>@<shortsha>` with `/` in the ref replaced by `-` (for example `main@a8f31c2`). `service.version` uses the same string. Source-map upload uses that string too.

## Routes

Bodies are plain JSON with no `input` wrapper. Batches are `{"<plural>":[…]}`. `POST /v1/replays/segments` and `POST /v1/heatmaps/snapshots` also accept `application/octet-stream` gzip.

| Method | Path | Auth | Scope |
| --- | --- | --- | --- |
| GET | `/v1/sdk-config` | pk or sk | any valid key |
| POST | `/v1/events` | pk or sk | `events:write` |
| POST | `/v1/spans` | pk or sk | `spans:write` |
| POST | `/v1/analytics` | pk or sk | `analytics:write` |
| POST | `/v1/replays` | pk or sk | `replays:write` |
| POST | `/v1/replays/segments` | pk or sk | `replays:write` |
| POST | `/v1/replays/{replayId}/finish` | pk or sk | `replays:write` |
| POST | `/v1/heatmaps` | pk or sk | `analytics:write` |
| POST | `/v1/heatmaps/snapshots` | pk or sk | `analytics:write` |
| POST | `/v1/screen-heatmaps` | pk or sk | `analytics:write` |
| POST | `/v1/screen-heatmaps/snapshots` | pk or sk | `analytics:write` |
| POST | `/v1/screen-heatmaps/recordings` | pk or sk | `analytics:write` |
| POST | `/v1/monitors/{slug}/check-ins` | sk | `monitors:write` |
| POST | `/v1/check-ins` | `tal_mon_` | monitor token |
| POST | `/v1/releases` | sk | `releases:write` |
| POST | `/v1/source-maps` | sk | `releases:write` |
| POST | `/v1/flags/evaluate` | pk or sk | `flags:evaluate` |
| GET | `/v1/flags?keys=` | sk | `flags:read` |
| POST | `/v1/client-reports` | pk or sk | any valid key |
| POST | `/otlp/v1/{traces,logs,metrics}` | pk or sk | `spans:write` / `logs:write` / `metrics:write` |

`POST /v1/deploys` returns 501 `not_implemented` and is not available.

SDKs and the CLI call `/v1/releases` and `/v1/source-maps`.

### Feature flags

`POST /v1/flags/evaluate` takes a JSON body `{anonymousId, userId, organizationId, sessionId, attributes, keys}` and returns `{"evaluations":[{"key","variationKey","valueJson","version","reason"}]}`.

`GET /v1/flags?keys=` lists definitions for a secret key and returns `{"flags":[…]}`.

### Source maps

`POST /v1/source-maps` takes plain JSON: `release`, `fileName`, optional `debugId`, and `gzipBytes` (base64 of the gzip bytes). The response includes `id`, `release`, `fileName`, and `sizeBytes`. See [Upload JavaScript source maps](../guides/upload-javascript-source-maps.md).

## Errors

`/v1/*` errors are `application/problem+json`: `{type, title, status, detail, code, requestId}`. The `Request-Id` response header is always present.

| Code | Status |
| --- | --- |
| `invalid_key` | 401 |
| `insufficient_scope` | 403 |
| `invalid_scope` | 400 |
| `wrong_cell` | 421, with `cell` and `url` |
| `not_found` | 404 |

`/otlp/v1/*` keeps the OTLP status body.

## Related

- [Environments and API keys](../get-started/environments-and-api-keys.md)
- [OTLP endpoint](otlp.md)
- [Quickstart](../get-started/quickstart.md)
- [Project settings](../get-started/project-settings.md)
