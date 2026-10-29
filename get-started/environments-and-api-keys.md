---
title: Environments and API keys
description: >-
  How publishable and secret keys decide the environment, which scopes each
  class may hold, and when to set TALARIA_URL.
tags:
  - environments
  - api-keys
  - configuration
id: environments-and-api-keys
navTitle: Environments and API keys
type: concept
section: get-started
platform: []
feature: []
order: 20
lastReviewed: '2026-10-29'
owner: docs
---

# Environments and API keys

Create keys in **Project settings › API keys**. A new key starts by choosing its class.

## Publishable keys and secret keys

| Class | Prefix | Safe in a bundle? | Env var |
| --- | --- | --- | --- |
| Publishable key | `tal_pk_<env>_nz1_…` | Yes. Browser and mobile. | `TALARIA_BROWSER_API_KEY` |
| Secret key | `tal_sk_<env>_nz1_…` | No. Server and CI only. | `TALARIA_API_KEY` |
| Release key | A secret key | No. | `TALARIA_RELEASE_KEY` |
| Monitor token | `tal_mon_nz1_…` | No. One monitor, send-only. | `TALARIA_MONITOR_TOKEN` |

`<env>` is `prod`, `stg`, `test`, or `dev`. The cell today is `nz1`. A monitor token has no environment segment. It can only call `POST /v1/check-ins`.

A release key is a secret key. `releases:write` only is the recommended scope for CI.

The browser, React, Next.js client, and Flutter SDKs refuse a secret key or a monitor token at init. Server SDKs log one warning when given a publishable key.

## Scopes

A new publishable key gets every publishable scope: `events:write`, `spans:write`, `logs:write`, `metrics:write`, `analytics:write`, `replays:write`, and `flags:evaluate`.

| Scope | Publishable | Secret |
| --- | --- | --- |
| Data `:write` scopes and `flags:evaluate` | yes | yes |
| `flags:read`, `monitors:write`, `releases:write` | no | yes |

Asking for a secret-only scope on a publishable key returns 400 `invalid_scope`. A publishable key on a secret-only route returns 403 `insufficient_scope`.

## What the environment controls

Every API key is bound to one environment: production, staging, test, or development. The server stamps that environment onto events, spans, analytics, replays, and heatmaps. SDKs do not send it.

The dashboard reads one environment at a time: Production, Staging, Test, Development, or All. It defaults to Production when the project has a production key, otherwise Development.

Issues are grouped separately per environment. Most alerts with no environment filter evaluate as production. LogRate alerts count error-level logs (severity ≥ 17) across environments and have no environment filter.

Feature flags are one definition per project. Evaluation uses the key's environment.

Test, staging, and production use the plan meters. Development has its own included cap and does not create overage. See [pricing](/pricing).

## Host

On Talaria Cloud the SDK derives `https://ingest-nz1.newtalaria.com` from the key's cell. OTLP is that host plus `/otlp`. Leave `url` and `TALARIA_URL` unset.

Set `TALARIA_URL` or the `url` option only for a self-hosted API or a custom domain. `api.newtalaria.com` does not serve ingest or OTLP. MCP stays at `https://api.newtalaria.com/mcp`.

Send `Authorization: Bearer` and the credential. That is the only auth header.

## Public prefixes

Only these four may use `NEXT_PUBLIC_`, `VITE_`, or `--dart-define`: `TALARIA_URL`, `TALARIA_BROWSER_API_KEY`, `TALARIA_RELEASE`, and `TALARIA_COMMIT_SHA`.

> [!CAUTION]
> **Never** prefix `TALARIA_API_KEY`, `TALARIA_RELEASE_KEY`, or `TALARIA_MONITOR_TOKEN` with `NEXT_PUBLIC_` or `VITE_`, and never put a `tal_sk_` or `tal_mon_` value in a public variable.

## Related

- [Project settings](project-settings.md)
- [Quickstart](quickstart.md)
- [Ingest API](../reference/ingest-api.md)
