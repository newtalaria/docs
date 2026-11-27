---
title: Laravel
description: "Install talaria/laravel 3.0.3. Do not call Talaria::init yourself."
section: sdk
order: 100
---

`talaria/laravel` **3.0.3** is the Laravel **10 / 11 / 12** adapter. PHP **8.1+**.

```bash
composer require talaria/laravel:^3.0
```

```env
TALARIA_API_KEY=tal_sk_prod_nz1_…
TALARIA_BROWSER_API_KEY=tal_pk_prod_nz1_…
TALARIA_RELEASE=1.4.2
```

Do **not** call `Talaria::init()` yourself. The service provider initialises the client. A missing or malformed key never breaks the app: the client is disabled and one warning goes to the Laravel log.

Leave `TALARIA_URL` empty on Talaria Cloud. `TALARIA_RELEASE` is optional; in GitHub Actions or GitLab the SDK sends `<ref>@<shortsha>` when it is unset.

HTML responses on the `web` middleware group load `@newtalaria/browser` from jsDelivr. The default script version is **0.6.0** (`TALARIA_BROWSER_SDK_VERSION`). The current published browser SDK is **0.6.1**; set the env var if you want that pin. Replay, heatmaps, and web vitals start only when the project allows them. Set `TALARIA_BROWSER=false` to skip the script. The injected key is `TALARIA_BROWSER_API_KEY` and must be a `tal_pk_` key. The server `tal_sk_` key is not injected.

See [configuration](/sdk/laravel/configuration/), [errors](/sdk/laravel/errors/), and [tracing](/sdk/laravel/tracing/). For SiteHost logs, see the [SiteHost guide](/guides/collectors/sitehost/).
