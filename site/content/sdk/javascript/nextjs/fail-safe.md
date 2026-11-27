---
title: Next.js fail-safe
description: What Next.js does when the key is missing or the wrong kind.
section: sdk
order: 47
---

A missing or invalid key **disables** Talaria instead of throwing, on both the client and server entrypoints. A secret key must not land in the client bundle. See [Fail-safe](/get-started/fail-safe/) and the [Next.js hub](/sdk/javascript/nextjs/).

Related: [Next.js](/sdk/javascript/nextjs/), [Next.js configuration](/sdk/javascript/nextjs/configuration/).
