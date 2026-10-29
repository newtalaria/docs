---
title: Environments and client keys
description: >-
  How client keys decide environments, what environments control, and when to use
  multiple keys.
tags:
  - environments
  - api-keys
  - configuration
id: environments-and-client-keys
navTitle: Environments and client keys
type: concept
section: get-started
platform: []
feature: []
order: 20
lastReviewed: '2026-10-29'
owner: docs
---

# Environments and client keys

Every API key is bound to exactly one environment: **production**, **staging**, **test**, or **development**. The key prefix identifies its environment:

- `tal_prod_...` — production
- `tal_stg_...` — staging  
- `tal_test_...` — test
- `tal_dev_...` — development

The server stamps the key's environment onto every span. SDKs never send an environment value. The key decides it.

## Client keys vs other keys

**Client keys** (also called ingest keys) are what your app uses to send data.

Create them in the dashboard at **Project settings › Client keys**.

Other key types serve different purposes:
- **Release keys** (`TALARIA_RELEASE_KEY`) have the `releases:write` scope for CI uploads
- **Monitor tokens** (`TALARIA_MONITOR_TOKEN`) are per-monitor secrets for check-ins
- **MCP tokens** are OAuth tokens or personal tokens for agent access

Only client keys get the environment prefix and control which environment your data lands in.

## What environments control

### Dashboard filtering

The dashboard reads one environment at a time: **Production**, **Staging**, **Test**, **Development**, or **All**. 

The environment selector defaults to:
- **Production** when the project has a production key
- **Development** otherwise
- **All** is an explicit choice that shows data from every environment

### Issues and fingerprints

Issues are grouped separately per environment. The same crash in production and staging creates two issues, each storing its environment. A sibling-issue link shows related issues across environments.

### Alerts

Most alerts with no environment filter evaluate as production. **Exception**: logRate alerts count error-level logs (severity ≥ 17) across all environments with no environment filter available.

### Feature flags

Feature flags stay one definition per project. Flag evaluation uses the key's environment to match targeting rules. A rule can target specific environments: `production`, `staging`, `test`, or `development`.

### Billing

**Test, staging, and production** use the plan's meters, including pay-as-you-go.

**Development** has its own included cap (equal to the plan's inclusion for each signal), hard-stops when the cap is reached, and never creates overage charges.

## When to use multiple keys

### Same app, different deploys

Use environment-specific keys:
- Production deploy → `tal_prod_...`
- Staging deploy → `tal_stg_...`
- CI test runs → `tal_test_...`
- Local development → `tal_dev_...`

### Browser and server in one app

Some apps need two keys:
- A **browser client key** that's safe to include in public JavaScript bundles
- A **server client key** for backend errors and traces

Both can be the same environment (e.g., both `tal_prod_...`), or you can use `tal_dev_...` for the browser during development and `tal_prod_...` for the server.

PHP, Laravel, and Silverstripe support `TALARIA_BROWSER_API_KEY` to inject a different key into pages. Other platforms pass the browser key as a build-time variable (e.g., `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY`).

### CI release uploads

CI needs two keys:
1. A client key for the app (can be development or production)
2. A **release key** with `releases:write` scope for source-map uploads

Release keys don't have an environment prefix and work across all environments.

## How SDKs use the key

SDKs send the key as:
```http
POST https://ingest.newtalaria.com/v1/events
X-API-Key: tal_prod_...
```

Or as a Bearer token:
```http
Authorization: Bearer tal_prod_...
```

The server reads the key, looks up its environment, and stamps every ingested record with that environment. The app never sends it separately.

### Framework public prefixes for browser keys

When your app has both server and browser code (Next.js, Vite, etc.), use framework-specific prefixes for browser environment variables:

- **Next.js**: `NEXT_PUBLIC_TALARIA_URL`, `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY`, optionally `NEXT_PUBLIC_TALARIA_RELEASE`, `NEXT_PUBLIC_TALARIA_COMMIT_SHA`
- **Vite**: `VITE_TALARIA_URL`, `VITE_TALARIA_BROWSER_API_KEY`, `VITE_TALARIA_RELEASE`, `VITE_TALARIA_COMMIT_SHA`

> [!CAUTION]
> `TALARIA_API_KEY` and `TALARIA_RELEASE_KEY` **must never carry a public prefix** (`NEXT_PUBLIC_` or `VITE_`). Server code uses the unprefixed variables. Only `TALARIA_BROWSER_API_KEY`, `TALARIA_URL`, `TALARIA_RELEASE`, and `TALARIA_COMMIT_SHA` get the public prefix for browser bundles.

## Changing environments

To move an app from development to production:
1. Create a production key in the dashboard
2. Replace `TALARIA_API_KEY` (or the framework public prefix like `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY`)
3. Deploy or restart the app

The new key's environment applies immediately to all new data.

## Related

- [Project settings](project-settings.md) — Remote configuration for tracing, analytics, and replay
- [Quickstart](quickstart.md) — Create your first project and key
- [API reference](../reference/ingest-api.md) — How the server handles keys
