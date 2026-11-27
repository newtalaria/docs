---
title: API reference
description: Ingest and OTLP, key scopes, and generated MCP tools.
section: reference
order: 10
---

- [OTLP endpoint](/reference/otlp/) — HTTP ingest for traces, logs, and metrics
- [Environments and API keys](/get-started/environments-and-api-keys/) — key kinds and scopes
- [MCP tools](/agents/mcp/) — the 47-tool catalogue, prompts, and resources

Official SDKs send JSON batches to the API origin (`https://ingest-<cell>.newtalaria.com`), with `Authorization: Bearer`. Errors are `application/problem+json`. Remote config is `GET /v1/sdk-config`. Discard reports go to `POST /v1/client-reports`. A generated OpenAPI surface from Serverpod types is not in this wave.
