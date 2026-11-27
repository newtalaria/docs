---
title: Laravel configuration
description: Environment variables and the browser script for talaria/laravel 3.0.3.
section: sdk
order: 101
---

The adapter is registered through `Talaria\Laravel\TalariaServiceProvider` and the `Talaria` facade. Set `TALARIA_API_KEY`, optionally `TALARIA_BROWSER_API_KEY`, `TALARIA_RELEASE`, `TALARIA_URL`, `TALARIA_BROWSER`, and `TALARIA_BROWSER_SDK_VERSION`.

Tracing and analytics follow [project settings](/get-started/project-settings/). Octane, Horizon, and Livewire are supported as documented in the package (suggested composer extras). Long-lived workers should rely on the adapter's flush and reset between requests.
