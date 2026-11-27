---
title: Node.js configuration
description: Init options for @newtalaria/node, including remote config and worker reset.
section: sdk
order: 51
---

Use a secret `tal_sk_…` key in `TALARIA_API_KEY`. `remoteConfig: true` loads project policy from `GET /v1/sdk-config`. Leave `url` unset on Talaria Cloud.

Call `Talaria.resetRequestState()` between jobs on a long-lived worker. A missing or invalid key disables Talaria instead of throwing.
