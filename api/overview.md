---
title: API overview
description: Ingest auth, event shape, environments and releases — enough to integrate without an SDK.
tags: [api, ingest]
---

# API overview

Prefer an official SDK. When integrating raw HTTP:

## Auth

Send the project ingest key as `X-API-Key` or `Authorization: Bearer tal_live_…`.

## Base URL

Talaria Cloud: `https://ingest.newtalaria.com`.

## Environments and releases

Pass `environment` and `release` on events so Issues and release health segment correctly.

## Related

- [Quickstart](../getting-started/quickstart.md)
- [Configuration](../getting-started/configuration.md)
- [SDK hub](../sdk/README.md)
