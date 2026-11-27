---
title: Getting started
description: Create an account, set up your first project, and send events from your app with Talaria.
section: get-started
order: 10
---

Start here if you are new to Talaria.

1. Create an account at [one.newtalaria.com](https://one.newtalaria.com).
2. Create a project and copy a **publishable** key for browsers and mobile apps (`tal_pk_…`), or a **secret** key for servers (`tal_sk_…`). Never put a secret key in client code, docs HTML, or a chat paste.
3. Follow the [quickstart](/get-started/quickstart/) or pick your platform from the [SDK hub](/sdk/).
4. Leave `TALARIA_URL` unset on Talaria Cloud. The SDK derives `https://ingest-<cell>.newtalaria.com` from the key. The key also decides the environment. Do not pass `environment` in SDK init.

More getting-started pages (project settings, fail-safe) land in the content rewrite. Until then, the quickstart is enough to send a first event.
