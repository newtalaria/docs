---
title: SDKs
description: Official Talaria SDKs for JavaScript, Dart, and PHP families.
section: sdk
order: 10
---

Official SDKs send errors, traces, and related signals to `https://ingest-<cell>.newtalaria.com` (derived from the key). Leave `url` / `TALARIA_URL` unset on Talaria Cloud. The key decides the environment. A missing or invalid key disables Talaria; it does not take the app down. See [fail-safe](/get-started/fail-safe/).

## JavaScript

Current release **0.6.1**.

- [JavaScript (browser)](/sdk/javascript/) — `@newtalaria/browser`
- [React](/sdk/javascript/react/) — `@newtalaria/react` (guide under JavaScript)
- [Next.js](/sdk/javascript/nextjs/) — `@newtalaria/nextjs`
- [Node.js](/sdk/javascript/node/) — `@newtalaria/node`

## Dart and Flutter

- [Dart](/sdk/dart/) — `talaria` **0.4.1**
- [Flutter](/sdk/flutter/) — `talaria_flutter` **0.3.1** (publishable key only)
- [Serverpod](/sdk/serverpod/) — `talaria_serverpod` **0.3.3** (with `talaria` **0.4.1**, Serverpod **^4.1.0**)

## PHP

Current release **3.0.3**. PHP **8.1+**.

- [PHP](/sdk/php/) — `talaria/talaria`
- [Laravel](/sdk/laravel/) — `talaria/laravel` (Laravel 10, 11, or 12)
- [Silverstripe](/sdk/silverstripe/) — `talaria/silverstripe` (4.13+, 5, or 6)

For stacks without an official SDK, use the [OpenTelemetry quickstarts](/guides/).
