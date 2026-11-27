---
title: Organisation REST API
description: "Read issues, events, traces, logs, and metrics on api.newtalaria.com with an organisation token."
section: reference
order: 30
---

The organisation REST API is a **read** surface on the control-plane host `https://api.newtalaria.com`. It is not ingest and it is not OTLP. Project API keys (`tal_pk_…`, `tal_sk_…`) and monitor tokens do not work here. Send telemetry to `https://ingest-nz1.newtalaria.com` (native `/v1` or [`/otlp`](/reference/otlp/)) instead.

## Auth and shape

- Base URL: `https://api.newtalaria.com/api/v1`
- Auth: `Authorization: Bearer` and an organisation token (`tal_org_<cell>_…`)
- Rate limit: 60 requests per minute
- Errors: RFC 9457 `application/problem+json`, same as ingest
- OpenAPI document: `GET https://api.newtalaria.com/api/v1/openapi.json` — no token required

```bash
curl -sS https://api.newtalaria.com/api/v1/openapi.json | head
```

```bash
curl -sS https://api.newtalaria.com/api/v1/organization \
  -H "Authorization: Bearer tal_org_nz1_…"
```

Mint and revoke organisation tokens in the dashboard. Treat them as secrets.

## Routes

All paths are under `https://api.newtalaria.com`. Methods are `GET` unless noted.

| Method | Path |
| --- | --- |
| GET | `/api/v1/organization` |
| GET | `/api/v1/projects` |
| GET | `/api/v1/projects/{projectId}` |
| GET | `/api/v1/issues` |
| GET | `/api/v1/issues/{issueId}` |
| GET | `/api/v1/events` |
| GET | `/api/v1/traces` |
| GET | `/api/v1/logs` |
| GET | `/api/v1/metrics` |
| GET | `/api/v1/reports` |
| POST | `/api/v1/reports/run` |
| GET | `/api/v1/reports/{reportId}` |
| POST | `/api/v1/exports` |
| GET | `/api/v1/exports/{exportId}` |
| GET | `/api/v1/exports/download` |
| GET | `/api/v1/openapi.json` |

List endpoints return a page of items and may include `nextCursor`. Query parameters for search and pagination are in the OpenAPI document.

## Related

- [Ingest API](/reference/ingest-api/) — project keys, `/v1` write routes
- [OTLP](/reference/otlp/) — OpenTelemetry HTTP ingest
- [MCP](/agents/mcp/) — agent tools on `https://api.newtalaria.com/mcp` (OAuth or a personal token, never an API key)
