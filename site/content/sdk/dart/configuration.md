---
title: Dart configuration
description: Init options, key kinds, and span batching for talaria 0.4.1.
section: sdk
order: 61
---

`Talaria.init` takes `TalariaOptions` with `apiKey`, optional `release`, `minLevel`, `url`, and span-batch fields:

| Option | Default | Role |
| --- | --- | --- |
| `spanBatchSize` | 200 | Spans per `/v1/spans` batch (at most 200) |
| `spanFlushIntervalMs` | 5000 | Longest a span waits before a partial batch is sent. `0` sends only full batches and explicit flushes |
| `maxSpanExportsPerMinute` | 30 | Ceiling on automatic span requests a minute |
| `maxSpanQueueSize` | 2048 | Spans held while waiting; overflow is `queue_overflow` |

`Talaria.flush()` and `Talaria.close()` send queued spans, unless a rate limit or quota has paused that signal. Do not call `flush()` after every request on a long-running server.

A publishable `tal_pk_` key is accepted on the Dart VM and logs one warning: ingest works, but releases, flag definitions, and monitor check-ins need a `tal_sk_` key. `Talaria.isEnabled` and `client.disabledReason` tell you why a client is off.

Requests use `Authorization: Bearer`. Batches are plain JSON. Policy is `GET /v1/sdk-config`. Discard reports are `POST /v1/client-reports`.
