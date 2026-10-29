# Talaria Docs Tooling

Infrastructure for IA Phase 1: registries, frontmatter schema, and CI validation.

## Status

✅ **Registries built** with Deploy & CI section  
✅ **Frontmatter schema** includes `ci` and `host` fields  
✅ **CI validation** in place  
✅ **Minimal owners stub** (`docs` only, per PM)  
⏸️ **File moves HALTED** - awaiting updated IA_SPEC.md and redirects.json from UX

## What's been built

### Registries (`_registry/`)

All registries follow the spec in IA_SPEC.md §11:

- **`sections.yaml`** - 7 sections including **Deploy & CI** (order 35, between Features and Agents)
- **`platform-families.yaml`** - Dart, JavaScript, PHP families
- **`platforms.yaml`** - 10 SDK platforms (Flutter, Dart, Serverpod, JavaScript, React, Next.js, Node.js, PHP, Laravel, Silverstripe)
- **`features.yaml`** - 12 features (Issues, Performance, Logs, Runtime, Session replay, Analytics, Feature flags, Releases, Alerts, Monitors, Dashboard AI)
- **`integrations.yaml`** - Kubernetes, SiteHost collectors (will move to Deploy & CI)
- **`ci-providers.yaml`** - GitHub Actions (live), GitLab CI (hidden), Bitbucket (hidden)
- **`hosts.yaml`** - Kubernetes, SiteHost (live); Docker, Vercel, Fly.io (hidden)
- **`mcp-clients.yaml`** - 8 MCP clients (Cursor, Grok Bot, VS Code, Copilot CLI, Claude Code, Gemini CLI, Codex, Windsurf)
- **`agent-skills.yaml`** - 5 skills (get-started, instrument, observe-performance, triage-issue, verify-fix)
- **`agent-plugin.yaml`** - Plugin metadata
- **`api-versions.yaml`** - Ingest v1 + 3 MCP protocol versions
- **`landing.yaml`** - Landing page hero and popular links
- **`owners.yaml`** - Minimal stub with single `docs` owner (per PM decision)

### Schema and validation (`_tools/`)

- **`schema.ts`** - Zod frontmatter schema with:
  - All fields from IA_SPEC.md §10.1
  - **`ci`** and **`host`** fields for Deploy & CI pages (research.md §4.1a)
  - Section-specific validation rules
  - Rejects legacy `sdk:` field
  
- **`registries.ts`** - Registry loader with:
  - Zod schemas for each registry type
  - Validation of relationships (families, parents, etc.)
  - Duplicate ID detection
  
- **`validate.ts`** - CLI validator that checks:
  1. Registry validity
  2. Frontmatter schema compliance
  3. Unique IDs and aliases
  4. Content rules (no localhost, harness paths, prices)
  5. Freshness warnings (180-day lastReviewed)
  
- **`build-manifest.ts`** - Stub for generating manifest.yaml (phase 1)
- **`sync-snippets.ts`** - Stub for snippet synchronization (phase 2)

### CI/CD

- **`.github/workflows/validate.yml`** - GitHub Actions workflow
  - Runs on every PR that touches docs, registries, or tooling
  - Validates registries and frontmatter
  - Checks snippet sync (phase 2, currently non-blocking)

## Deploy & CI Section

Per PM/UX update, the IA now includes a **Deploy & CI** section between Features and Agents:

```
Deploy & CI                        /docs/deploy/
  ├─ Overview                      /docs/deploy/
  ├─ CI Providers                  /docs/deploy/ci/
  │   └─ GitHub Actions            /docs/deploy/ci/github-actions
  └─ Hosts & Runtimes              /docs/deploy/hosts/
      ├─ Kubernetes                /docs/deploy/hosts/kubernetes
      └─ SiteHost                  /docs/deploy/hosts/sitehost
```

### Frontmatter for Deploy & CI pages

Pages in this section use either `ci:` or `host:` (mutually exclusive):

```yaml
# CI provider page
---
id: github-actions-deploy
title: GitHub Actions
section: deploy-ci
ci: github-actions
type: guide
# ...
---

# Host page
---
id: kubernetes-collector
title: Kubernetes
section: deploy-ci
host: kubernetes
type: guide
# ...
---
```

The schema enforces:
- Pages in `deploy-ci` section must have either `ci` or `host`
- Cannot have both `ci` and `host`
- Values must exist in `ci-providers.yaml` or `hosts.yaml`

### What moves where

**Collectors move to Deploy & CI**, not Features › Integrations:

- `sdk/collector/kubernetes.md` → `deploy/hosts/kubernetes.md`
- `sdk/collector/sitehost.md` → `deploy/hosts/sitehost.md`

Both need `aliases:` for old paths and `redirectFrom:` entries.

## Current validation status

```bash
cd _tools
npm run validate
```

**Result:** 
✅ Registries valid  
❌ Pages missing frontmatter (expected - no file moves yet)

All pages currently fail validation because they lack required frontmatter fields (`id`, `type`, `section`, `lastReviewed`, `owner`). This is expected and will be fixed during the IA migration when frontmatter is added to every page.

## What's NOT done (awaiting UX)

🔴 **File moves** - halted until updated IA_SPEC.md and redirects.json arrive  
🔴 **Frontmatter additions** - waiting for final paths  
🔴 **Redirects generation** - needs final source/destination mappings  
🔴 **Manifest generation** - depends on completed frontmatter

## PM decisions reflected

Per the binding PM decisions in the user query:

- ✅ Section name is **Features** (not Capabilities)
- ✅ Minimal `owners.yaml` with single `docs` owner (no per-page owners)
- ✅ MCP tool count is 44 (documented, not invented)
- ✅ No Cursor Marketplace claims anywhere
- ✅ File moves deferred because of platform snapshot dependency

## Next steps (after UX update)

When updated IA_SPEC.md and redirects.json arrive:

1. Review updated paths for Deploy & CI section
2. Create migration script (`migrate-ia.ts`) to:
   - `git mv` files per §3.3 mapping
   - Add typed frontmatter with `aliases` and `redirectFrom`
   - Rewrite relative links
3. Add frontmatter to 4 bare pages (monitors, runtime, kubernetes, sitehost)
4. Generate `manifest.yaml` from frontmatter
5. Generate `_generated/redirects.json` (44 entries)
6. Test validation passes
7. Open PR

## Running locally

```bash
# Install dependencies
cd _tools
npm install

# Validate all registries and pages
npm run validate

# Build manifest (stub)
npm run build:manifest

# Check snippets (stub, phase 2)
npm run check:snippets
```

## Architecture notes

- **Registries are YAML** for easy PM/UX editing (no TypeScript knowledge needed)
- **Schema is strict** - unknown fields fail, enforcing consistency
- **Validation runs in CI** - bad frontmatter blocks merge
- **Generated surfaces** from registries (nav, switcher, landing, etc.) come in marketing PR
- **Files starting with `_`** are never routed, indexed, or in manifest

## Questions for PM/UX

**Q1:** Has platform MCP `docs_get` alias resolution shipped? File moves depend on it.  
**Q2:** Updated IA_SPEC.md and redirects.json with Deploy & CI paths?  
**Q3:** Should GitHub Actions page exist in phase 1, or stub only?
