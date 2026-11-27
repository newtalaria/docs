---
title: Silverstripe configuration
description: Environment, flush, and optional YAML for the Silverstripe adapter.
section: sdk
order: 111
---

Set `TALARIA_API_KEY` and flush (`vendor/bin/sake dev/build flush=1`). Optional `TALARIA_BROWSER_API_KEY` injects the browser SDK (publishable key only). Leave `TALARIA_URL` unset on Talaria Cloud. Optional YAML for log level, service name, and browser inject lives in the package; keep secrets in the environment, not in the repository.
