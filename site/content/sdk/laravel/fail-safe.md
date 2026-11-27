---
title: Laravel fail-safe
description: What Laravel does when the key is missing or the wrong kind.
section: sdk
order: 107
---

A missing or invalid key **disables** Talaria instead of throwing. A publishable key on a PHP server is accepted for ingest and flag evaluation, with one warning; releases, flag definition downloads, and monitor check-ins still need a secret key. See [Fail-safe](/get-started/fail-safe/).

Related: [Laravel](/sdk/laravel/), [Laravel configuration](/sdk/laravel/configuration/).
