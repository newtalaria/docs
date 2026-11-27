---
title: Dart fail-safe
description: What Dart does when the key is missing or the wrong kind.
section: sdk
order: 67
---

A missing or invalid key **disables** Talaria instead of throwing. A publishable key on a Dart VM server is accepted for ingest and flag evaluation, with one warning; releases, flag definition downloads, and monitor check-ins still need a secret key. See [Fail-safe](/get-started/fail-safe/).

Related: [Dart](/sdk/dart/), [Dart configuration](/sdk/dart/configuration/).
