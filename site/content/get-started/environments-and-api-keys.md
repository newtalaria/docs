---
title: Environments and API keys
description: How publishable and secret keys work, what they may be used for, and how the environment is chosen.
section: get-started
order: 30
---

Talaria keys are minted in the dashboard under project client keys. The key decides the **environment** (`prod`, `stg`, `test`, or `dev` in the secret-key form) and the **cell**. Do not pass `environment` in SDK init.

## Key kinds

| Kind | Shape | Use |
| --- | --- | --- |
| Publishable | `tal_pk_…` | Browsers, Flutter, and other client apps. Safe to embed in a built app. |
| Secret | `tal_sk_<env>_<cell>_…` | Servers, CI, and collectors. Never ship this in a browser bundle, a mobile app, docs HTML, or a chat paste. |

A third token, `tal_mon_…`, is a stored monitor check-in token. Official SDKs refuse it as an init key (they disable Talaria instead of sending). Cron check-ins that the SiteHost installer writes use that token only against `POST /v1/check-ins`.

## What each key can do

- **Ingest** (errors, spans, analytics) works with a publishable or a secret key that has the matching write scope.
- **OTLP logs** (`POST /otlp/v1/logs`) need a **secret** key with `logs:write`. A publishable key is rejected as `403 insufficient_scope`.
- **Releases, monitor registration, and `GET /v1/flags`** need a secret key with the matching scope.
- **`POST /v1/flags/evaluate`** accepts a publishable or a secret key.
- **MCP** does not accept these keys at all. Use OAuth or a personal token from **Settings → Integrations**. See [MCP and agents](/agents/).

## Ingest host

On Talaria Cloud, leave `url` and `TALARIA_URL` unset. Official SDKs send to `https://ingest-<cell>.newtalaria.com` from the key. Collectors and OpenTelemetry exporters use that host plus `/otlp`, for example:

```
https://ingest-nz1.newtalaria.com/otlp
```

A `self` cell has no cloud host. Talaria stays disabled until you set `url` or `TALARIA_URL`. Self-host collector configs use `TALARIA_URL` and that value must end with `/otlp`.

## Examples (placeholders only)

```bash
# Browser / Flutter
tal_pk_prod_nz1_…

# Server / collector
tal_sk_prod_nz1_…
```

Rotate a leaked secret in the dashboard and update the environment variable. Restart SiteHost containers after changing env vars.
