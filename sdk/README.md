---
title: SDKs
description: Official Talaria SDK guides — pick your stack.
tags: [sdk]
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

Agents: filter `docs_search` / `docs_list` with an `sdk` value matching the table. After the hub, `docs_get` `sdk/<id>/instrumentation` and `sdk/<id>/errors`. Search `analytics` or `feature flags` for [best practices](javascript/best-practices.md) on that sdk.
