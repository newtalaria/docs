---
title: PHP configuration
description: Init options, flags, and CI release defaults for talaria/talaria 3.0.3.
section: sdk
order: 91
---

Init takes `apiKey`, optional `release`, `minLevel`, and optional `url` / `TALARIA_URL`. Tracing and analytics follow [project settings](/get-started/project-settings/). Omit `release` in GitHub Actions or GitLab and the SDK sends `<ref>@<shortsha>`.

Requests use `Authorization: Bearer`. Batches are plain JSON (`{"events":[…]}`, `{"spans":[…]}`) with no `input` wrapper. Remote config is `GET /v1/sdk-config`. Discard reports go to `POST /v1/client-reports`.

```php
Talaria::flags()->setContext(userId: $userId);
$on = Talaria::flags()->boolVariation('new-checkout', false);
```

Evaluations are cached for the PHP request (or until TTL on long-lived workers). `POST /v1/flags/evaluate` accepts a `tal_pk_` or `tal_sk_` key. Call `loadDefinitions()` with a `tal_sk_` key that has `flags:read` for local evaluation.
