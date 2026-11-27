---
title: Self-host and deploy
description: Pointers to collector guides, CI, and self-host ingest. Not a second copy of those guides.
section: deploy
order: 10
---

Use this section for how you run Talaria next to a deployment. Collector how-tos live under [Guides](/guides/collectors/) so they are not copied twice.

- [SiteHost containers](/guides/collectors/sitehost/)
- [Kubernetes](/guides/collectors/kubernetes/)
- [OTLP/HTTP](/guides/collectors/otlp/)
- [CI](/deploy/ci/)
- [CLI](/cli/) for `talaria collector`, `talaria plan`, Helm, systemd, and Compose generation

## Self-host ingest

When the collector is generated with deploy mode `self-host`, the exporter endpoint is `${env:TALARIA_URL}` and that value must end with `/otlp`. Official SDKs use `TALARIA_URL` or the `url` option as the API origin (no `/otlp` suffix). A `self` cell disables the official SDK until that URL is set.

This page does not cover DNS, TLS, or nginx — those stay with the platform runbooks.
