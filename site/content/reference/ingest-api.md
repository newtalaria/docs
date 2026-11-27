---
title: Ingest API
description: Native /v1 ingest routes on the cell ingest host. This is not the organisation REST API.
section: reference
order: 20
---

Official SDKs and the CLI speak this HTTP surface. The host is the cell ingest origin, for example `https://ingest-nz1.newtalaria.com`. Leave `url` unset in an official SDK on Talaria Cloud; it derives that origin from the key.

OpenTelemetry exporters use a different path on the same host: [`https://ingest-nz1.newtalaria.com/otlp`](/reference/otlp/). Organisation read APIs live on [`https://api.newtalaria.com/api/v1`](/reference/openapi/) and do not accept project API keys.

Do not send OTLP or `/v1` ingest to `api.newtalaria.com`. That host does not serve `/otlp`.

## Auth

Send `Authorization: Bearer` and a project key:

- Publishable `tal_pk_<env>_<cell>_…` or secret `tal_sk_<env>_<cell>_…` for the scopes in the table below.
- Monitor check-ins after registration use a `tal_mon_…` token, only on `POST /v1/check-ins`.

`X-API-Key` is accepted for API keys but is not the documented form. A key minted for another cell is rejected with `421` and `wrong_cell`.

Default publishable scopes cover events, spans, replays, analytics, metrics, and `flags:evaluate`. Secret-only scopes include `releases:write`, `flags:read`, `monitors:write`, and `logs:write`. See [Environments and API keys](/get-started/environments-and-api-keys/).

## Request shape

- Every `POST` takes a JSON object body. `Content-Encoding: gzip` is allowed. The cap is **6 MiB** after decompression; larger bodies return `413`.
- The body is the input object itself. Batch routes take only `{"<plural>": [...]}`. A Serverpod RPC envelope (`{"input": {...}}`) is refused with `400 invalid_body`.
- A trailing slash is accepted; canonical paths have none.
- Errors are RFC 9457 `application/problem+json`. Successful JSON responses may include a `Request-Id` header; include it when you ask for support.

## Routes

Host: `https://ingest-nz1.newtalaria.com` (or `https://ingest-<cell>.newtalaria.com`).

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/v1/events` | `events:write` |
| POST | `/v1/spans` | `spans:write` |
| POST | `/v1/analytics` | `analytics:write` |
| POST | `/v1/replays` | `replays:write` |
| POST | `/v1/replays/segments` | `replays:write` |
| POST | `/v1/replays/{replayId}/finish` | `replays:write` |
| POST | `/v1/heatmaps` | `analytics:write` |
| POST | `/v1/heatmaps/snapshots` | `analytics:write` |
| POST | `/v1/screen-heatmaps` | `analytics:write` |
| POST | `/v1/screen-heatmaps/snapshots` | `analytics:write` |
| POST | `/v1/screen-heatmaps/recordings` | `analytics:write` |
| POST | `/v1/monitors/{slug}/check-ins` | `monitors:write` |
| POST | `/v1/check-ins` | `tal_mon_…` token |
| POST | `/v1/releases` | `releases:write` |
| POST | `/v1/source-maps` | `releases:write` |
| POST | `/v1/flags/evaluate` | `flags:evaluate` |
| GET | `/v1/flags?keys=a,b` | `flags:read` |
| GET | `/v1/sdk-config?schemaVersion=&revision=` | any API-key scope |
| POST | `/v1/client-reports` | any API-key scope |
| POST | `/v1/deploys` | `releases:write` |

`/v1/replays/segments` and `/v1/heatmaps/snapshots` also accept a raw gzip payload when `Content-Type` is `application/octet-stream`.

OTLP/HTTP paths are documented on [OTLP](/reference/otlp/). Logs at `POST /otlp/v1/logs` need a **secret** key with `logs:write`. A publishable key is `403 insufficient_scope`.

The old RPC paths and `/ingest/v1/*` return `404`.

## Remote config and discards

Official SDKs call `GET /v1/sdk-config` and report dropped events or spans to `POST /v1/client-reports`. Any valid project API key can call both.

## Flags

`POST /v1/flags/evaluate` accepts a publishable or secret key with `flags:evaluate`. The JSON body is `{anonymousId, userId, organizationId, sessionId, attributes, keys}` and the response is `{"evaluations":[…]}`. `GET /v1/flags` downloads definitions and needs a secret key with `flags:read`. See [Feature flags](/guides/feature-flags/).

## Releases, deploys, and source maps

`POST /v1/releases` and `POST /v1/deploys` need a secret key with `releases:write`. A deploy is idempotent per project, release, environment, and `deployedAt` truncated to the UTC minute. The Go CLI exposes this as `talaria releases deploy --env`.

`POST /v1/source-maps` takes a plain JSON object, not an `input` wrapper:

```json
{
  "release": "main@a1b2c3d",
  "fileName": "_next/static/chunks/app.js",
  "gzipBytes": "<base64 gzip of the map>",
  "debugId": "optional-debug-id"
}
```

Limits are 2 MiB for the gzip payload and 4 MiB for the JSON body. Dart and Flutter debug symbols use a separate upload with 16 MiB gzip / 32 MiB JSON limits. See [Source maps](/guides/source-maps/) and [Releases](/guides/releases/).

## Monitors

Register a monitor with `POST /v1/monitors/{slug}/check-ins` and a secret key that has `monitors:write`. The response includes `monitorToken` once. Later check-ins go to `POST /v1/check-ins` with that `tal_mon_…` token. Details: [Monitors](/guides/monitors/).

## Example

```bash
curl -sS https://ingest-nz1.newtalaria.com/v1/flags/evaluate \
  -H "Authorization: Bearer tal_pk_prod_nz1_…" \
  -H "Content-Type: application/json" \
  -d '{"keys":["checkout-v2"],"userId":"user-123"}'
```

Collectors and OpenTelemetry SDKs should call `https://ingest-nz1.newtalaria.com/otlp` instead of these `/v1` routes. See [OTLP](/reference/otlp/) and [Collectors](/guides/collectors/).
