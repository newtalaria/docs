# Generated Files

Build outputs that are committed and CI-checked for byte-identical regeneration.

## `manifest.yaml`

**MCP compatibility layer** at repo root, generated from frontmatter.

```yaml
revision: 1.0.0
pages:
  - id: flutter-errors
    path: sdk/flutter/errors.md
    title: Flutter errors, logs and breadcrumbs
    description: "..."
    sdk: flutter  # legacy field = platform[0]
    platforms: [flutter]
    type: guide
    section: platforms
    features: [issues, logs]
    status: stable
    tags: [errors, breadcrumbs]
```

The MCP server reads this to serve `list_docs` and `search_docs`.

**Greenfield docs:** No redirects or aliases needed (no live external users per Heath decision 29 Oct 2026).

## `search-facets.json`

Per-facet value lists for search UI (phase 2).

```json
{
  "platforms": ["flutter", "dart", "react", ...],
  "types": ["hub", "quickstart", "guide", ...],
  "sections": ["get-started", "platforms", ...],
  "features": ["issues", "performance", ...]
}
```

## CI checks

GitHub Actions validates:
- `manifest.yaml` regenerates byte-identically
- `manifest.yaml` matches frontmatter
