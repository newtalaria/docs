---
title: Getting started
description: Create an account, set up a project, and send a first event into Talaria.
section: get-started
order: 10
---

Start here if you are new to Talaria.

1. Create an account at [one.newtalaria.com](https://one.newtalaria.com).
2. Create a project and copy a **publishable** key for browsers and mobile apps (`tal_pk_…`), or a **secret** key for servers and collectors (`tal_sk_<env>_<cell>_…`). Never put a secret key in client code, docs HTML, or a chat paste.
3. Follow the [quickstart](/get-started/quickstart/) or pick your platform from the [SDK hub](/sdk/).
4. Leave `TALARIA_URL` unset on Talaria Cloud. Official SDKs derive `https://ingest-<cell>.newtalaria.com` from the key. Collectors export to that host plus `/otlp`. The key also decides the environment — do not pass `environment` in SDK init.

Then add a [collector](/guides/collectors/) if you want host or container logs, or point your [agent](/agents/) at the docs.

- [Environments and API keys](/get-started/environments-and-api-keys/)
- [Project settings](/get-started/project-settings/)
- [Fail-safe](/get-started/fail-safe/)

Copy the publishable key, project, and ingest host from the dashboard. Secrets are never written into the page.
