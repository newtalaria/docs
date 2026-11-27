---
title: PHP fail-safe
description: What PHP does when the key is missing or the wrong kind.
section: sdk
order: 97
---

A missing or invalid key **disables** Talaria instead of throwing. A publishable key on a PHP server is accepted for ingest and flag evaluation, with one warning; releases, flag definition downloads, and monitor check-ins still need a secret key. See [Fail-safe](/get-started/fail-safe/).

Related: [PHP](/sdk/php/), [PHP configuration](/sdk/php/configuration/).
