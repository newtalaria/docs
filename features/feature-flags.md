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

Feature flags let you control feature availability remotely without deploying new code. Create flags in the dashboard, define targeting rules by environment, user, organization, or custom attributes, and evaluate them from your app.

## How flags work

1. **Define flags** in the Talaria dashboard
2. **Set targeting rules** by environment, user ID, organization, or custom attributes
3. **Evaluate flags** in your SDK using `Talaria.isEnabled(key)` or similar
4. **Change rules** in the dashboard—SDKs fetch updates automatically

Flag definitions are shared across all environments within a project. Targeting rules specify which environments and users see which variant.

## Evaluating flags from SDKs

SDKs fetch flag definitions from `GET /v1/flags` at initialization using an API key with the `flags:read` scope. Evaluation happens client-side based on user context:

```javascript
// JavaScript/React/Next.js
if (Talaria.isEnabled('new-checkout')) {
  // Show new checkout flow
}
```

```dart
// Dart/Flutter
if (Talaria.isEnabled('new-checkout')) {
  // Show new checkout flow
}
```

```php
// PHP/Laravel/Silverstripe
if (Talaria::isEnabled('new-checkout')) {
  // Show new checkout flow
}
```

Pass user context to improve targeting:

```javascript
Talaria.identify({
  userId: 'user-123',
  organizationId: 'org-456',
  attributes: {
    plan: 'enterprise',
    beta: true
  }
});
```

## API key scopes

- **`flags:read`** — Fetch flag definitions (used by SDKs at initialization)
- **`flags:evaluate`** — Evaluate flags with server-side API calls (optional, for server-rendered pages that can't use client-side evaluation)

Most apps use `flags:read` in their client key and evaluate flags client-side. Use `flags:evaluate` only when server-side rendering requires flag state before the page loads.

## Full API contract

See [GET /v1/flags](../reference/ingest-api.md#feature-flags) in the Ingest API reference for query parameters and response shape.

## Related

- [Ingest API reference](../reference/ingest-api.md)
- [Project settings](../get-started/project-settings.md)
