---
title: Feature flags
description: Evaluate flags in an official SDK, or download definitions with a secret key.
section: guides
order: 130
---

Flags are defined in the project and evaluated by the SDK at runtime. Evaluation uses the ingest host, for example `https://ingest-nz1.newtalaria.com`, not the organisation REST API.

## Evaluate in an official SDK

JavaScript and Dart expose `Talaria.flags.boolVariation`, `stringVariation`, and `jsonVariation`. PHP uses `Talaria::flags()->boolVariation` (and the matching string and JSON helpers).

```ts
const enabled = await Talaria.flags.boolVariation('checkout-v2', false);
```

```dart
final enabled = await Talaria.flags.boolVariation('checkout-v2', false);
```

```php
$enabled = Talaria::flags()->boolVariation('checkout-v2', false);
```

Pass a default for when the client is disabled, the flag is missing, or the network fails. A missing or invalid key [disables Talaria](/get-started/fail-safe/) instead of throwing; evaluations then return that default.

## Ingest routes

- `POST /v1/flags/evaluate` accepts a publishable or secret key with `flags:evaluate`.
- `GET /v1/flags?keys=a,b` downloads definitions and needs a secret key with `flags:read`.

```bash
curl -sS https://ingest-nz1.newtalaria.com/v1/flags/evaluate \
  -H "Authorization: Bearer tal_pk_prod_nz1_…" \
  -H "Content-Type: application/json" \
  -d '{"keys":["checkout-v2"],"userId":"user-123"}'
```

See the [Ingest API](/reference/ingest-api/).

## MCP

After you [connect MCP](/agents/mcp/), an agent can list flags, get one, and set a rollout to off or to a percentage. Those tools change the project definition; they are not a substitute for SDK evaluation in production traffic.

## Related

- [Environments and API keys](/get-started/environments-and-api-keys/)
- [Project settings](/get-started/project-settings/)
