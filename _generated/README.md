# Generated Files

Build outputs that are committed and CI-checked for byte-identical regeneration.

## `redirects.json`

Generated from `redirectFrom` frontmatter fields across all pages.

**Expected count:** 44 entries (per redirects.json provided by UX)

```json
[
  {
    "source": "/docs/getting-started",
    "destination": "/docs/get-started",
    "permanent": true
  }
]
```

### Build process

1. `_tools/build-manifest.ts` collects all `redirectFrom` entries
2. Validates no chains (A→B→C) or loops
3. Writes to `_generated/redirects.json`
4. Marketing build copies to `public/_redirects.json`
5. `deploy/sitehost/app.js` loads and serves as 301s

### Static fallback

For each source, `app/docs/[...slug]/page.tsx` also renders a stub page with:
- `<meta http-equiv="refresh" content="0; url=destination">`
- `<link rel="canonical" href="destination">`
- `<meta name="robots" content="noindex">`
- Visible link for JS-disabled clients

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
    aliases: [sdk/flutter/errors.md]
```

The MCP server reads this to serve `docs_list`, `docs_search`, and resolve `docs_get` aliases.

### Alias resolution requirement

**Phase 0 gate:** Platform must ship alias resolution before any file moves. Otherwise installed plugin skills that call `docs_get("guides/add-talaria-with-an-agent")` will break when that file moves to `agents/playbooks/instrument.md`.

## CI checks

GitHub Actions validates:
- `redirects.json` regenerates byte-identically
- No redirect chains or loops
- All redirect sources exist as stubs in build output
- `manifest.yaml` matches frontmatter (when implemented)
