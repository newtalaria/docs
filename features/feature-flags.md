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

Coding agents can read and update flags with MCP tools: `get_feature_flag`, `list_feature_flags`, `set_feature_flag_off`, and `set_feature_flag_percent`. See the [MCP tools reference](../agents/mcp/README.md).

## Limits and billing

- **`flags:evaluate`** — Evaluate flags (browser-safe)
- **`flags:read`** — Read flag definitions

See [GET /v1/flags](../reference/ingest-api.md#feature-flags) in the Ingest API reference for the complete endpoint specification.
