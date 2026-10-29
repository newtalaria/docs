**DO NOT MERGE (coordinated release)**

## IA Phase 1 Implementation (v1.3.1)

**Status**: ✅ Ready for review  
**Head**: `69af60a`  
**Validation**: `npm run validate` exits **0**, **0 warnings**  
**Link check**: All 71 pages, **zero broken links**

### Completed Tasks

#### 1. Untrack `_tools/node_modules` (1,704 files)
- `git rm -r --cached _tools/node_modules`
- Retained `.gitignore` and `package-lock.json`
- `node_modules/` now ignored by Git as intended

#### 2. Zero Redirects / Zero Aliases (Pure Greenfield)
- Removed `redirectFrom` and `aliases` from schema, validator, build script
- Deleted `_generated/redirects.json`
- Stripped all `redirectFrom:` and `aliases:` from page frontmatter
- Updated README files to document greenfield architecture

#### 3. Regenerate `manifest.yaml` in Main's Format
- Unquoted keys (removed `defaultStringType: "QUOTE_DOUBLE"`)
- `package: "@newtalaria/cli"` now comes from frontmatter (generator preserves it)
- Revision bumped to `1.0.0`
- 71 pages in clean YAML format

#### 4. Add `get-started/environments-and-client-keys.md`
- New concept page per IA_SPEC v1.3.1 §3.1
- Documents `tal_prod_`, `tal_stg_`, `tal_test_`, `tal_dev_` key prefixes
- Explains client keys vs release keys vs monitor tokens
- Environment facts (only spans store environment, logRate alerts have no environment filter)
- Framework public prefixes: `NEXT_PUBLIC_TALARIA_BROWSER_API_KEY`, `VITE_TALARIA_BROWSER_API_KEY`, optionally `*_RELEASE`, `*_COMMIT_SHA`
- **CAUTION**: `TALARIA_API_KEY` and `TALARIA_RELEASE_KEY` must **never** carry public prefix
- Linked from `get-started/README.md`, `quickstart.md`, and `project-settings.md`

#### 5. Fix 254 Broken Relative Links + Add Link Validator
Links fixed:
- `getting-started/*` → `get-started/*`
- `configuration.md` → `project-settings.md`
- `guides/*-with-an-agent.md` → `agents/*.md`
- All SDK and agent path corrections

Link validator (step 4b in validate.ts):
- Validates all markdown `[text](path)` links resolve
- Fails CI on broken relative or `/docs` links
- Handles `README.md` as directory references

### File Changes
- **14 commits** from main
- **103 files** changed
- **+6,020 / -1,167** lines

### Validation Results
```
Exit code: 0
Warnings: 0
Link check: 0 broken links
```

### References
- IA_SPEC v1.3.1 §3.1, §3.3
- Heath greenfield decision (no redirects, no aliases)
- TIS §2.1 browser env vars (PM: COMMIT_SHA allowed with public prefix)
- phase0-infra.md for environment facts