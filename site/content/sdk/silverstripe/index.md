---
title: Silverstripe
description: Install talaria/silverstripe 3.0.3 and flush. Optional SiteHost installer.
section: sdk
order: 110
---

`talaria/silverstripe` **3.0.3** supports Silverstripe **4.13+, 5, and 6**. PHP **8.1+**.

```bash
composer require talaria/silverstripe:^3.0
```

```bash
TALARIA_API_KEY="tal_sk_prod_nz1_…"
# TALARIA_BROWSER_API_KEY="tal_pk_prod_nz1_…"
vendor/bin/sake dev/build flush=1
```

Leave `TALARIA_URL` empty on Talaria Cloud. Tracing and analytics follow [project settings](/get-started/project-settings/).

## SiteHost

`vendor/bin/talaria-sitehost install` reads `talaria/sitehost/monitors.json` and reconciles one crontab block and the supervisord probe. The SiteHost deploy action runs this command and also installs the log collector. Full steps: [SiteHost containers](/guides/collectors/sitehost/).

See [configuration](/sdk/silverstripe/configuration/), [errors](/sdk/silverstripe/errors/), and [tracing](/sdk/silverstripe/tracing/).
