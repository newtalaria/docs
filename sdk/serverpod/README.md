---
title: Serverpod SDK
description: Wire talaria_serverpod — Relic SERVER spans, Postgres CLIENT spans, FutureCall CONSUMER roots.
sdk: serverpod
package: talaria_serverpod
tags: [serverpod, dart, install]
---

# Serverpod SDK

Add both `talaria` and `talaria_serverpod`. Turn tracing on under [Project settings](../../getting-started/configuration.md).

## Prerequisites / supported versions

- Serverpod ^4.0.0

## Package name + install command

```yaml
dependencies:
  talaria: ^0.2.3
  talaria_serverpod: ^0.1.3
  serverpod: ^4.0.0
```

## Initialization

Pass `databaseInterceptor` to the `Serverpod` constructor — it cannot be swapped later. Call adapter init/attach per the package README and pub.dev docs.

## App init vs Project settings

DSN/API key in init; tracing sample rates in Project settings.

## API key / DSN / environment variables

Use env / dart-define for `TALARIA_API_KEY`. Never commit keys.

## Optional features

SERVER spans on Relic, CLIENT spans on Postgres, CONSUMER roots on FutureCalls when tracing is on.

## Verification

Hit an endpoint; MCP `search_traces` / `get_trace`.

## Troubleshooting

Interceptor must be set at construct time. Tracing off in Project settings means errors only.

## Related docs

- [Dart](../dart/README.md)
- [Flutter tracing](../flutter/tracing.md)
- [Configuration](../../getting-started/configuration.md)
