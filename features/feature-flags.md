---
id: feature-flags
title: Feature flags
navTitle: Feature flags
description: >-
  Toggle features remotely with targeting rules based on user context and
  environment.
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

Feature flags let you control feature availability remotely without deploying new code. Create flags in the dashboard, define targeting rules by environment, user, or organization, and evaluate them from your SDK.

## Evaluating flags

SDKs read flags using an API key with the `flags:read` scope. Evaluate flags with `boolVariation`, `stringVariation`, or `jsonVariation`:

```javascript
// JavaScript/React/Next.js
const on = await Talaria.flags.boolVariation('new-checkout', false);
```

```dart
// Dart/Flutter
final on = await Talaria.flags.boolVariation('new-checkout', false);
```

Pass a key and a default value. When the flag is off or undefined, the default is returned. See the [JavaScript SDK configuration](../sdk/javascript/configuration.md#feature-flags) and [Flutter SDK configuration](../sdk/flutter/configuration.md#feature-flags) pages for full code examples.

## API key scopes

- **`flags:read`** — Read flag definitions
- **`flags:evaluate`** — Evaluate flags server-side (optional)

## Full API contract

See [GET /v1/flags](../reference/ingest-api.md#feature-flags) in the Ingest API reference for the complete endpoint specification.
