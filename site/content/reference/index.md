---
title: API reference
description: Ingest and OTLP, problem types, key scopes, and generated MCP tools.
section: reference
order: 10
---

The public ingest endpoint is `https://ingest-<cell>.newtalaria.com/otlp` (OTLP/HTTP, protobuf or JSON, gzip allowed). There is no gRPC. Authenticate collectors with a secret key as `Authorization: Bearer tal_sk_…`.

Generated reference (MCP tools, problem types, OpenAPI from Serverpod types) is a later phase. Until then, the raw material is in `reference/` and `api/` at the repo root.
