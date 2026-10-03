# Contributing to Talaria docs

## Frontmatter

Every page needs:

```yaml
---
title: Flutter SDK
description: Install talaria_flutter, bootstrap with runZonedApp, capture errors and routes.
sdk: flutter          # required on SDK pages
package: talaria_flutter  # install hubs
tags: [flutter, dart, install]
# related: [sdk/dart/README.md, getting-started/configuration.md]
---
```

## SDK guide shape

Every public SDK folder (`sdk/<id>/`) has these pages:

| File | Opens with | Search words in the title, tags, and h2s |
| --- | --- | --- |
| `README.md` | Quick setup, then What you can do | `install`, `init` |
| `instrumentation.md` | What Project settings turns on, then each automatic integration | `instrumentation`, `tracing` |
| `errors.md` | capture, logs, breadcrumbs, user | `errors`, `logs`, `breadcrumbs` |
| `best-practices.md` | release, sampling, then Analytics and Feature flags | `analytics`, `feature-flags` |

Browser packages also use h2s for Session replay, Heatmaps, Web Vitals, and Consent on `best-practices.md`, with a `replay` tag. Laravel and Silverstripe document the injected `@newtalaria/browser` script there.

The hub keeps these headings so `docs_search` for `install` and `init` still lands on the README:

1. Quick setup
2. What you can do
3. Install
4. Initialization
5. App init vs Project settings
6. API key
7. Verification
8. Related docs

Put the words an agent types in the title, the manifest `tags`, and an h2. Body text alone ranks last. Set manifest `sdk` to the filter value (`javascript`, `react`, `nextjs`, `node`, `php`, `laravel`, `silverstripe`, `dart`, `flutter`, `serverpod`). Write calls from that package's public API.

## Callouts

Use GitHub admonitions:

```markdown
> [!NOTE]
> Helpful context.

> [!NOTE]
> `tal_live_…` keys are public client ingest credentials (browser/mobile safe).
```

## Links

Prefer relative `.md` links inside this repo. Site URLs under `/next-docs/...` are derived from paths (drop `README.md`, drop `.md`).

## Manifest

Add every public page to `manifest.yaml` with `id`, `path`, `title`, `description`, and optional `sdk` / `tags` / `package`.
