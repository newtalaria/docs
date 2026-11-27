---
title: Serverpod fail-safe
description: What Serverpod does when the key is missing or the wrong kind.
section: sdk
order: 87
---

A missing or invalid key **disables** Talaria instead of throwing. A publishable key on a Dart VM server is accepted for ingest and flag evaluation, with one warning; releases, flag definition downloads, and monitor check-ins still need a secret key. See [Fail-safe](/get-started/fail-safe/).

Related: [Serverpod](/sdk/serverpod/), [Serverpod configuration](/sdk/serverpod/configuration/).
