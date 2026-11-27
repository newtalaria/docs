---
title: Serverpod tracing
description: Endpoint, Postgres, FutureCall, and outbound HTTP spans.
section: sdk
order: 83
---

| Surface | Span |
| --- | --- |
| Endpoint RPC and web routes | SERVER `{METHOD} {route}` — continues inbound W3C `traceparent` |
| Postgres / SQLite ORM and `unsafeQuery` | CLIENT, sanitized SQL when available |
| FutureCalls | CONSUMER `FutureCall.{name}` |
| Streaming methods | SERVER for the stream lifetime (not per chunk) |
| Authenticated session | `enduser.id` / `user.id` on the session span |
| Outbound `HttpClient` after init | CLIENT, continues the active trace. `package:http` still uses `Talaria.wrapHttpClient` |

Skipped: ingest routes, Insights, `/livez`, `/readyz`, `/startupz`, `/robots.txt`, `/favicon.ico`, `/.well-known/`, and Talaria SDK endpoints (`sdk/getConfig`, `sdk/reportDiscards`, replay and heatmap uploads, `flags/evaluate` / `flags/downloadDefinitions`). Bind values are never sent. Repeated identical queries are each sent so N+1 stays visible.

Spans are batched; the middleware does not flush after every request. Tracing follows [project settings](/get-started/project-settings/).
