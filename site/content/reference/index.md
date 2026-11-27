---
title: API reference
description: Ingest and OTLP, the organisation REST API, and key scopes.
section: reference
order: 10
---

- [Ingest API](/reference/ingest-api/) — native `/v1` routes on the ingest host
- [OTLP endpoint](/reference/otlp/) — HTTP ingest for traces, logs, and metrics
- [Organisation REST API](/reference/openapi/) — OpenAPI document and org-token routes on `api.newtalaria.com`
- [Error types](/reference/errors/) — RFC 9457 `code` and `type` anchors
- [MCP tools](/reference/mcp-tools/) — the current server export (47 tools)
- [SDK configuration options](/reference/sdk-config/) — init options for JS, PHP, Dart, and Flutter
- [Environments and API keys](/get-started/environments-and-api-keys/) — key kinds and scopes
- [MCP clients](/agents/mcp/) — how to connect a coding agent

Official SDKs send JSON batches to the API origin (`https://ingest-<cell>.newtalaria.com`), with `Authorization: Bearer`. Errors are `application/problem+json`. Remote config is `GET /v1/sdk-config`. Discard reports go to `POST /v1/client-reports`. Organisation reads use `https://api.newtalaria.com/api/v1` and a `tal_org_` token. Cloud OTLP is `https://ingest-nz1.newtalaria.com/otlp`.
