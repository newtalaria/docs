**DO NOT MERGE (coordinated release)**

## TIS v0.2 Integration Standard (Phase 0)

**Status**: ✅ Ready for review  
**Head**: `68e088e`  
**Validation**: `npm run validate` exits **0**, **55 warnings** (existing pages, per spec)  
**Legacy naming**: **0 occurrences**  
**MCP URLs**: Verified on `api.newtalaria.com/mcp` (22 files)

### Completed Tasks

Merged all PR #4 fixes, then completed TIS v0.2 hard cut with PM updates.

#### TIS v0.2 Complete Implementation

**Kubernetes Rewrite** (`deploy/hosts/kubernetes.md`):
- Task frontmatter: `type: guide`, `section: deploy-ci`, structured `notFor`/`prereqs`/`verify`/`next`
- Only 7 H2s + `## For agents` (no `Related`)
- Resource processor in cluster pipeline
- Gauge/logRate alert caveats (logRate: severity ≥ 17, no env filter, service-only; Gauges: 15min lookback)
- MCP `search_logs` example uses `<your-deployment-name>` (matches `k8s.deployment.name`)
- CronJob: `TALARIA_URL=https://ingest.newtalaria.com`, `X-Talaria-Monitor-Token`, secret key `monitor-token`
- `otlp_http`, `k8s_cluster`, `otelcol-contrib:0.164.0`

**Comprehensive Naming Sweep** (TIS v0.2):

Environment variables:
- `TALARIA_DSN` → `TALARIA_URL`
- `TALARIA_BROWSER_DSN` → `TALARIA_BROWSER_API_KEY`
- `TALARIA_SERVICE_NAME` → `OTEL_SERVICE_NAME`
- `TALARIA_PING_TOKEN` → `TALARIA_MONITOR_TOKEN`

Routes:
- **`POST /v1/check-ins`** (monitor token in `X-Talaria-Monitor-Token`)
- **`POST /v1/monitors/{slug}/check-ins`** (API key)
- **`GET /v1/flags`** (API key with `flags:read`)
- MCP stays on `api.newtalaria.com/mcp`

MCP tools renamed:
- `search_errors` → `search_issues`
- `get_error` → `get_issue`
- `get_logs` → `search_logs`
- All updated in `_registry/features.yaml`

**Feature Flags** (PM update):
- Created `features/feature-flags.md` (type: feature, lean content)
- Added `flags:read` and `flags:evaluate` to `_registry/key-scopes.yaml`
- `reference/ingest-api.md`: Full `GET /v1/flags` contract with query params (response shape: TODO(platform-234))

**SDK Documentation**:
- Removed `sdk/getConfig` path everywhere (9 files)
- Describe "SDK fetches project configuration" instead
- `/sdk/getConfig` hidden from route docs
- Added forbidden patterns: `\bsdk/getConfig\b`

**Browser Env Vars** (TIS §2.1):
- Allowed public prefixes: `BROWSER_API_KEY`, `URL`, `RELEASE`, `COMMIT_SHA`
- Forbidden: `TALARIA_API_KEY` and `TALARIA_RELEASE_KEY` with public prefix
- CAUTION blocks on JavaScript, React, Next.js SDK pages
- Updated environments page with complete list

**Validator Enhancements**:
- 48+ forbidden patterns (scans `_registry/*.yaml` too)
- Public-prefix allow-list checks **every match** individually
- Task-page H2 lint: only `For agents` allowed after 7 fixed H2s (no `Related`)
- MCP tool validation against `features.yaml` registry
- Manifest freshness: builds to temp file and diffs
- Schema fix: `host` is single value, not array

**Other Fixes**:
- `rotateMonitorToken` documented on `features/monitors.md`
- All `release@v1` examples marked illustrative
- SiteHost: `monitors.yaml` as YAML, not JSON
- `reference/otlp.md`: Complete frontmatter, fixed endpoints

### File Changes
- **35 commits** from main (includes 14 from PR #4 merge)
- **114 files** changed
- **+7,460 / -1,609** lines

### Validation Results
```
Exit code: 0
Warnings: 55 (existing pages, per spec)
Legacy patterns (rg): 0
Forbidden patterns: 0
```

### Route Table
- ✅ `POST /v1/check-ins` — monitor token (`X-Talaria-Monitor-Token`)
- ✅ `POST /v1/monitors/{slug}/check-ins` — API key
- ✅ `GET /v1/flags` — API key with `flags:read`
- ⏳ `POST /v1/deploys` — Phase 2 only (501)

### References
- TIS v0.2 naming standard (hard cut)
- IA_SPEC v1.3.1
- PM decisions: feature flags page, COMMIT_SHA allowed, /sdk/getConfig hidden