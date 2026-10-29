---
title: Platforms
description: >-
  Official Talaria SDKs for Flutter, Dart, Serverpod, JavaScript, React,
  Next.js, Node.js, PHP, Laravel, and Silverstripe.
tags:
  - sdk
id: sdk
navTitle: Choose SDK
type: hub
section: platforms
platform: []
feature: []
order: 10
lastReviewed: '2026-10-29'
owner: docs
---

# SDKs

Official guides for install, configure, and capture.

| Stack | Package | Hub |
| ----- | ------- | --- |
| Flutter | `talaria_flutter` | [sdk/flutter](flutter/README.md) |
| Dart | `talaria` | [sdk/dart](dart/README.md) |
| Serverpod | `talaria_serverpod` | [sdk/serverpod](serverpod/README.md) |
| JavaScript | `@newtalaria/browser` | [sdk/javascript](javascript/README.md) |
| React | `@newtalaria/react` | [sdk/react](react/README.md) |
| Next.js | `@newtalaria/nextjs` | [sdk/nextjs](nextjs/README.md) |
| Node.js | `@newtalaria/node` | [sdk/node](node/README.md) |
| PHP | `talaria/talaria` | [sdk/php](php/README.md) |
| Laravel | `talaria/laravel` | [sdk/laravel](laravel/README.md) |
| Silverstripe | `talaria/silverstripe` | [sdk/silverstripe](silverstripe/README.md) |

Each guide opens with a quick setup and a short map of what that package can do. The next pages in the same folder are the instrumentation guide, errors and logs, and best practices.

JavaScript, React, and Next.js source maps: [Upload JavaScript source maps](../guides/upload-javascript-source-maps.md).

## Upgrade guides

SDK majors that change init or config have their own upgrade pages:

| Package | Guide |
| --- | --- |
| `talaria/talaria`, and the Laravel pair | [PHP upgrade](php/upgrade.md) |
| `talaria/silverstripe` with `talaria/talaria` | [Silverstripe upgrade](silverstripe/upgrade.md) |

Agents: filter `search_docs` / `list_docs` with an `sdk` value matching the table. After the hub, `get_doc` `sdk/<id>/errors` and `sdk/<id>/tracing`. Search `analytics` or `feature flags` for [configuration](javascript/configuration.md) on that sdk.
