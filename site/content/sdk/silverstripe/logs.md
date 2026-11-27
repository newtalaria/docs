---
title: Silverstripe logs
description: How Silverstripe sends logs, and when to use a collector.
section: sdk
order: 114
---

The Silverstripe adapter sends errors and traces. File logs from a SiteHost container go through the in-container collector — see the [SiteHost case study](/guides/collectors/sitehost/). For other hosts, use a collector or an OpenTelemetry exporter over [OTLP/HTTP](/guides/collectors/otlp/). Enable Logs in [project settings](/get-started/project-settings/).

Related: [Silverstripe](/sdk/silverstripe/), [Silverstripe configuration](/sdk/silverstripe/configuration/).
