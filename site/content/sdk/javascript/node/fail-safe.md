---
title: Node.js fail-safe
description: What Node.js does when the key is missing or the wrong kind.
section: sdk
order: 57
---

A missing or invalid key **disables** Talaria instead of throwing. Use a secret key on the server and never ship it in a client bundle. See [Fail-safe](/get-started/fail-safe/).

Related: [Node.js](/sdk/javascript/node/), [Node.js configuration](/sdk/javascript/node/configuration/).
