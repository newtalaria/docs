---
title: Billing
description: How usage is metered and where to read prices. This site does not quote dollar amounts.
section: billing
order: 10
---

Talaria meters usage per organisation billing period. What is included, and what you pay, lives on [newtalaria.com/pricing](https://www.newtalaria.com/pricing). These docs do not quote dollar amounts.

Open **Settings › Billing** in the [dashboard](https://one.newtalaria.com) and choose the **Usage** tab to read usage, included volume, and spending caps. The MCP tool `get_project` with `include: ["stats"]` returns counts, not prices.

Project settings control whether metered surfaces (for example analytics or replay) are on. Confirm with the operator before enabling one through `update_project_settings`.
