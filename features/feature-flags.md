---
id: feature-flags
title: Feature flags
navTitle: Feature flags
description: >-
  Turn features on or off remotely and evaluate them from your SDK.
type: feature
section: features
platform: []
feature:
  - feature-flags
order: 70
lastReviewed: '2026-10-29'
owner: docs
---

# Feature flags

Feature flags let you control feature rollouts remotely without deploying code. Turn features on or off, or roll them out to a percentage of users. Quickly disable features when issues arise without redeploying.

## Turn it on

Create flags in **Flags** and evaluate them from your SDK.

## How it works

SDKs evaluate flags through `GET /v1/flags` using an API key with the `flags:evaluate` scope. Evaluate flags with `boolVariation`, `stringVariation`, or `jsonVariation`:

```javascript platform=javascript
// JavaScript/React/Next.js
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

```dart platform=flutter
// Dart/Flutter
final on = await Talaria.flags.boolVariation('new-checkout', false);
```

Pass a key and a default value. When the flag is off or undefined, the default is returned. See the [JavaScript SDK configuration](../sdk/javascript/configuration.md#feature-flags) and [Flutter SDK configuration](../sdk/flutter/configuration.md#feature-flags) pages for full code examples.

## Use it with an agent

Coding agents can manage flags via MCP. Ask your agent to list all feature flags, check the state of a specific flag, turn a flag off, or roll out a flag to a percentage of users. The tools are `list_feature_flags`, `get_feature_flag`, `set_feature_flag_off`, and `set_feature_flag_percent`. See the [MCP tools reference](../agents/mcp/README.md).

## Limits and billing

Feature flag evaluations are included in all plans. See [pricing](/pricing) for plan details.

- **`flags:evaluate`** — Evaluate flags (browser-safe)
- **`flags:read`** — Read flag definitions

See [GET /v1/flags](../reference/ingest-api.md#feature-flags) in the Ingest API reference for the complete endpoint specification.
