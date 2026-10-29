# Talaria Docs IA Phase 1 - Status Report

**Date:** October 29, 2026  
**Branch:** `cursor/docs-ia-phase1-6d20`  
**Status:** 🟡 Infrastructure complete, file moves HALTED pending UX update

---

## ✅ COMPLETED: Infrastructure & Registries

### What's been built

1. **11 Registry files** (`_registry/`)
   - `sections.yaml` - 7 sections including **Deploy & CI**
   - `platforms.yaml` + `platform-families.yaml` - 10 SDKs across 3 families
   - `features.yaml` - 12 product features with MCP tool mappings
   - `integrations.yaml` - 2 collectors (moving to Deploy & CI)
   - **`ci-providers.yaml`** - GitHub Actions, GitLab CI, Bitbucket (NEW)
   - **`hosts.yaml`** - Kubernetes, SiteHost, Docker, Vercel, Fly.io (NEW)
   - `mcp-clients.yaml` - 8 MCP clients
   - `agent-skills.yaml` - 5 skills
   - `agent-plugin.yaml` - Plugin metadata
   - `api-versions.yaml` - Ingest + 3 MCP versions
   - `landing.yaml` - Landing page configuration
   - `owners.yaml` - Minimal stub (single `docs` owner)

2. **Frontmatter schema** (`_tools/schema.ts`)
   - All fields from IA_SPEC.md §10.1
   - **`ci` field** for CI provider pages (research.md §4.1a)
   - **`host` field** for host/runtime pages (research.md §4.1a)
   - Section-specific validation rules
   - Rejects legacy `sdk:` field
   - Deploy & CI pages must have exactly one of `ci` or `host`

3. **Validation tooling** (`_tools/`)
   - `registries.ts` - Registry loader with Zod schemas
   - `validate.ts` - CLI validator (5 check phases)
   - `build-manifest.ts` - Stub for manifest generation
   - `sync-snippets.ts` - Stub for snippet sync (phase 2)
   - `package.json` + `tsconfig.json` - TypeScript tooling setup

4. **CI/CD** (`.github/workflows/validate.yml`)
   - Validates registries and frontmatter on every PR
   - Checks content rules (no localhost, prices, harness paths)
   - Freshness warnings for pages >180 days old

5. **Documentation**
   - `_tools/README.md` - Complete infrastructure docs
   - `_data/README.md` - MCP tools data spec
   - `_generated/README.md` - Build outputs spec
   - `PHASE1_STATUS.md` - This file

### Deploy & CI Section

Per PM/UX update, the IA now includes:

```
Deploy & CI                        /docs/deploy/              (order 35)
  ├─ CI Providers                  /docs/deploy/ci/
  │   └─ GitHub Actions            /docs/deploy/ci/github-actions
  └─ Hosts & Runtimes              /docs/deploy/hosts/
      ├─ Kubernetes                /docs/deploy/hosts/kubernetes
      └─ SiteHost                  /docs/deploy/hosts/sitehost
```

**Impact on file moves:**
- `sdk/collector/kubernetes.md` → `deploy/hosts/kubernetes.md`
- `sdk/collector/sitehost.md` → `deploy/hosts/sitehost.md`
- Both need `aliases:` and `redirectFrom:` for backward compat

### Validation status

```bash
cd _tools && npm run validate
```

**Result:**
```
1️⃣  Loading registries...
   ✅ Registries valid

2️⃣  Validating frontmatter...
   ❌ [71 pages missing required fields]
   
3️⃣  Checking uniqueness...
   ✅ No duplicates found
   
4️⃣  Checking content rules...
   ✅ Content rules pass
   
5️⃣  Checking freshness...
   ✅ All pages recently reviewed
```

Page failures are **expected** - no frontmatter exists yet because file moves are halted.

---

## ⏸️ HALTED: File Moves & Content Changes

Per your instruction, **all file moves are paused** until UX provides:

1. **Updated `IA_SPEC.md`** with Deploy & CI section paths
2. **Updated `redirects.json`** with Deploy & CI redirect mappings

### What needs updated IA_SPEC

The current uploaded `IA_SPEC_8a73.md` reflects the original plan where collectors moved to `features/integrations/`. The updated spec needs:

- §3.3 mapping table with Deploy & CI paths
- §9.1 file layout showing `deploy/ci/` and `deploy/hosts/`
- Updated redirect sources/destinations

### What needs updated redirects.json

The current uploaded `redirects_4c98.json` (44 entries) includes:

```json
{
  "source": "/docs/sdk/collector/kubernetes",
  "destination": "/docs/features/integrations/kubernetes",
  "permanent": true
}
```

This needs to change to:

```json
{
  "source": "/docs/sdk/collector/kubernetes",
  "destination": "/docs/deploy/hosts/kubernetes",
  "permanent": true
}
```

Same for SiteHost collector.

---

## 🚫 NOT DONE (Blocked on UX Update)

Cannot proceed until updated IA_SPEC + redirects arrive:

- [ ] `_tools/migrate-ia.ts` - File move script with `git mv`
- [ ] Frontmatter addition to all 71 pages
- [ ] Aliases and redirectFrom per updated mappings
- [ ] Relative link rewrites
- [ ] `_tools/build-manifest.ts` - Generate manifest.yaml
- [ ] `_generated/redirects.json` - Generate from frontmatter
- [ ] Testing and validation pass
- [ ] PR description with deploy gate

---

## ✅ PM Decisions Implemented

All binding PM decisions from your query are reflected:

1. **Section name is Features** ✅ (not Capabilities)
   - `sections.yaml` id: `features`, label: `Features`

2. **Minimal owners.yaml** ✅
   - Single `docs` owner, no per-page owners invented
   - Schema requires `owner: docs` on every page

3. **Keep Connect apps note** ✅ (skipped)
   - No marketing-specific content in docs repo

4. **No Cursor Marketplace claim** ✅
   - Not mentioned in any registry or docs

5. **MCP tool count is 44** ✅
   - Documented in `_data/README.md` from platform main a22afa2f
   - Not invented; waiting for actual generated `mcp-tools.json`

6. **File moves gate** ✅
   - Acknowledged: platform snapshot bump must not ship before alias resolution
   - PR description will state this gate explicitly

---

## 🎯 Scope for THIS PR (when moves resume)

Per IA_SPEC §9.6 Phase 1:

### Docs repo changes

1. ✅ **Registries** under `_registry/` (DONE)
2. ✅ **Frontmatter schema + CI lint** (DONE)
3. ⏸️ **IA migration** per §3.3 (BLOCKED - needs updated paths)
   - `git mv` moves/renames
   - Rewrite relative links
4. ⏸️ **Typed frontmatter** on every moved/renamed page (BLOCKED)
   - `aliases` (old repo paths for docs_get)
   - `redirectFrom` (from redirects.json)
   - Keep existing manifest ids unchanged
5. ⏸️ **Add frontmatter** to 4 bare pages (BLOCKED - needs final paths):
   - guides/monitors.md
   - guides/runtime.md
   - sdk/collector/kubernetes.md
   - sdk/collector/sitehost.md
6. ⏸️ **Generate `manifest.yaml`** from frontmatter (BLOCKED)
7. ⏸️ **Generate `_generated/redirects.json`** (BLOCKED - needs redirectFrom data)
8. 🔜 **Generated nav data** (marketing PR after this merges)
9. ⏸️ **P0 content fixes** from §8 rows 1-7 (BLOCKED - needs paths)

### Out of scope (later PRs)

- Marketing site Next.js shell (separate PR)
- Platform MCP server alias code (separate platform PR, launching)
- Phase 2 switcher/tabs/snippet sync
- Phase 3 feature rewrites / 44-tool reference page
- No dependency upgrades

---

## 📋 Next Steps (When Updated Files Arrive)

### Immediate (upon receiving updated IA_SPEC + redirects)

1. **Review** updated Deploy & CI paths in spec §3.3
2. **Verify** redirects.json has correct Deploy & CI destinations
3. **Build** `_tools/migrate-ia.ts` script:
   ```typescript
   // Reads §3.3 mapping
   // For each move: git mv, add frontmatter, rewrite links
   // Validates no broken links
   ```
4. **Run** migration (dry-run first)
5. **Test** validation passes
6. **Generate** manifest.yaml and redirects.json
7. **Test** MCP docs_get with old aliases
8. **Commit** and push

### PR Creation

Open PR with description including:

- **Explicit deploy gate** about platform aliases before snapshot bump
- Summary of moves and alias count (should be 44 redirects)
- How to run frontmatter lint locally (`cd _tools && npm run validate`)
- Link to this status document

### Marketing PR (after docs merge)

- Import registries
- Build nav from `sections.yaml` + frontmatter
- Platform switcher (phase 2)
- Landing grids from registries
- Redirects wired into app.js

---

## 🔍 Testing Commands

```bash
# Validate registries and frontmatter
cd _tools
npm install
npm run validate

# Check what would be generated (stubs for now)
npm run build:manifest
npm run check:snippets

# Git status
cd ..
git status
git log --oneline -5
git diff main --stat
```

---

## 📞 Questions for UX/PM

**Blocking questions:**

1. **When will updated IA_SPEC.md + redirects.json arrive?**
   - Need Deploy & CI paths in §3.3 mapping
   - Need corrected redirect destinations

2. **Should GitHub Actions page exist in phase 1?**
   - Or just stub for phase 3?
   - Spec marks rows 8-19 as P1, which includes some Deploy content

**Open questions:**

3. **Has platform MCP alias resolution shipped yet?** (Q1 from spec)
   - File moves depend on this
   - Need to test `docs_get("guides/add-talaria-with-an-agent")` resolves to new path

4. **Which other P0 content fixes from §8 apply to docs repo?**
   - Rows 1-7 are moves/renames
   - Some may be marketing-only

---

## 🎬 Branch & Commit Info

- **Branch:** `cursor/docs-ia-phase1-6d20`
- **Base:** `main` (commit a25c432)
- **Status:** Clean (all infrastructure committed)
- **Ready to:** Resume file moves when updated spec arrives

To view changes:

```bash
git log main..HEAD
git diff main --name-status
```

---

## 📚 Documentation Index

- [`_tools/README.md`](/_tools/README.md) - Infrastructure overview
- [`_data/README.md`](/_data/README.md) - MCP tools data spec
- [`_generated/README.md`](/_generated/README.md) - Build outputs
- [`PHASE1_STATUS.md`](/PHASE1_STATUS.md) - This status report

---

**Summary:** All infrastructure is ready. File moves and content changes are paused pending your updated IA_SPEC.md and redirects.json with Deploy & CI section paths. Once received, migration can proceed immediately.
