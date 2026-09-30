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

## Integration page checklist

SDK install / overview pages must include these headings (agents skim them):

1. Prerequisites / supported versions
2. Package name + install command
3. Initialization (copy-pasteable)
4. What belongs in **app init** vs **Project settings**
5. API key / DSN / environment variables (`tal_live_…` keys are public client ingest credentials)
6. Optional features (tracing, analytics, heatmaps, replay) and stack limits
7. Verification steps (run app → expect issue / event; dashboard + MCP checks)
8. Troubleshooting / common mistakes
9. Related docs

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
