---
title: SiteHost case study
description: Verified in-container OpenTelemetry Collector path for SiteHost PHP containers, with image baseline, assumptions, and limits.
section: guides
order: 55
---

This case study records the proven **in-container** path for SiteHost PHP containers using the sitehost-silverstripe / talaria-sitehost pattern: supervisord program `talaria-otelcol`, file tails under `/container/logs`, a secret key in the container environment as `TALARIA_API_KEY`, and OTLP/HTTP export to `https://ingest-nz1.newtalaria.com/otlp`.

Install steps live on [SiteHost containers](/guides/collectors/sitehost/). This page is the verification record, image assumptions, and limits — not a second installer recipe.

## Pattern

Run the collector **inside** the application container under supervisord. A sidecar cannot read `/container/logs` on SiteHost, so do not lead with a sidecar until log sharing is proven.

The collector tails application and web logs from `/container/logs` and exports over OTLP/HTTP. Set `TALARIA_API_KEY` only as a container environment variable (secret key with `logs:write`); never commit it.

## Verification

Verified **27 November 2026** at **14:29 Pacific/Auckland** on **shotoverjet-test**:

- Ubuntu 24.04
- PHP 8.2
- Apache
- supervisord
- Logs under `/container/logs`
- Egress to ingest on port 443

That image is the **supported baseline**. Other organisation images, and outbound 443 on hosts that have not been checked, remain unconfirmed until verified the same way.

## Limits

- OTLP is **HTTP only** (protobuf or JSON, gzip allowed). There is no gRPC ingest.
- Endpoint: `https://ingest-nz1.newtalaria.com/otlp` (or `https://ingest-<cell>.newtalaria.com/otlp` for another cell). See [OTLP/HTTP](/guides/collectors/otlp/) and the [OTLP reference](/reference/otlp/).
- Uncompressed bodies larger than **6 MiB** receive `413`.

## What the SDK adds

The collector covers file logs. The PHP, Laravel, or Silverstripe SDK is complementary: it sends exceptions, traces, and structured application logs on top of those files. See the [PHP SDK](/sdk/php/) and [Silverstripe](/sdk/silverstripe/).
