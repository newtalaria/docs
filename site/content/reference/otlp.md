---
title: OTLP endpoint
description: OTLP/HTTP ingest URL, protocol, authentication, payload cap, and status codes.
section: reference
order: 20
---

Talaria accepts OpenTelemetry Protocol (OTLP) data over **HTTP only** (protobuf or JSON). gRPC is not supported.

## Endpoint

```
https://ingest-nz1.newtalaria.com/otlp
```

Base URL. Clients append `/v1/traces`, `/v1/logs`, or `/v1/metrics`. Most SDKs and collectors do this when `OTEL_EXPORTER_OTLP_ENDPOINT` is set to the base.

Other cells use `https://ingest-<cell>.newtalaria.com/otlp`. Official SDKs (not collectors) talk to the origin without `/otlp`: `https://ingest-<cell>.newtalaria.com`.

## Authentication

`Authorization: Bearer` plus a project key. Collectors should use a secret key (`tal_sk_<env>_<cell>_…`) with the signal's write scope. `POST /otlp/v1/logs` requires `logs:write` on a **secret** key; a publishable key is `403 insufficient_scope`.

## Protocol and compression

| Protocol | Support |
| --- | --- |
| `http/protobuf` | Supported (recommended) |
| `http/json` | Supported |
| `grpc` | Not supported |

gzip is supported and recommended. Uncompressed bodies larger than **6 MiB** receive `413`.

## Status codes

| Code | Meaning |
| --- | --- |
| 200 | Accepted |
| 401 | Invalid or missing key |
| 403 | Insufficient scope |
| 413 | Body larger than 6 MiB after decompression |
| 429 | Rate limited (`Retry-After`) |
| 5xx | Retry with backoff |

How-to guides: [OTLP/HTTP](/guides/collectors/otlp/), [Kubernetes](/guides/collectors/kubernetes/), [SiteHost](/guides/collectors/sitehost/).
