---
title: Fail-safe
description: A missing or invalid key disables Talaria. It must not take the app down.
section: get-started
order: 50
---

Official SDKs follow **D19**: a missing, empty, malformed, or wrong-checksum key, or a key of the wrong kind, **disables Talaria instead of throwing**. The app keeps running. Calls become no-ops. At most one warning is logged, and that warning shows no more than the first eight characters of the key.

This is true of:

- `@newtalaria/browser`, `@newtalaria/react`, `@newtalaria/nextjs`, and `@newtalaria/node` **0.6.1**
- `talaria` **0.4.1**, `talaria_flutter` **0.3.1**, `talaria_serverpod` **0.3.3**
- `talaria/talaria`, `talaria/laravel`, and `talaria/silverstripe` **3.0.3**

## Wrong key kind

- Flutter init accepts only a publishable `tal_pk_…` key (from `--dart-define=TALARIA_BROWSER_API_KEY`). A `tal_sk_` or `tal_mon_` key disables Talaria and does not install error hooks.
- A publishable key on a Dart VM or PHP server is accepted for ingest and flag evaluation, with one warning. Releases, flag definition downloads, and monitor check-ins still need a secret key.
- A `tal_mon_` token is not an init key.

## Transport errors

Network failures, timeouts, `401`, and `5xx` are swallowed. They must not throw into your request path. Dart backs off and logs at most once a minute per channel. Official SDKs also send discard reports to `POST /v1/client-reports` when events or spans are dropped.

## What to check

- `Talaria.isEnabled` and `client.disabledReason` on Dart
- A single warning in the server or browser log on PHP and JavaScript
- The key shape (`tal_pk_` vs `tal_sk_<env>_<cell>_…`) and that client apps never received a secret key
