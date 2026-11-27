---
title: Project settings
description: How tracing, analytics, replay, and sample rates are controlled from the project, not from SDK flags alone.
section: get-started
order: 40
---

Tracing, product analytics, session replay, heatmaps, and sample rates follow **Project settings** in the dashboard. Official SDKs fetch `GET /v1/sdk-config` (remote config). You do not enable those surfaces by passing a one-off flag in init, and you should not copy a dollar amount or plan limit into your app.

## What the project controls

- Whether tracing, analytics, replay, and heatmaps are on
- Sample rates for those surfaces
- Ingest policy (what the project will accept)

The MCP tool `update_project_settings` can change the same fields when the grant has `mcp:setup`. Confirm with the operator before enabling a metered surface.

## Defaults that still live in the SDK

Init still takes a key, an optional `release`, and an optional `minLevel`. Leave `url` unset on Talaria Cloud. Long-lived workers (Node, PHP, Dart) may need an explicit reset or flush between jobs — see the [SDK](/sdk/) page for your stack.

## Releases

Set `release` in init, or rely on the official SDK's CI detection (for example PHP and Laravel send `<ref>@<shortsha>` in GitHub Actions or GitLab when `TALARIA_RELEASE` is unset). JavaScript source maps and Dart or Flutter debug symbols upload with `talaria sourcemaps upload`. The Next.js package can also upload maps at build time with a secret `TALARIA_RELEASE_KEY` — see [Next.js](/sdk/javascript/nextjs/).

## Billing

Usage and included volume are explained on [Billing](/billing/). Prices live on [newtalaria.com/pricing](https://www.newtalaria.com/pricing), not in these docs.
