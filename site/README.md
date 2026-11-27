# Talaria docs site

The greenfield static site for `https://docs.newtalaria.com`. Plan: `talaria-workspace` `docs/architecture/docs-site/PLAN.md`.

This directory is the Next.js App Router app (`output: "export"`). Author new-IA pages in `content/`. Existing Markdown at the repo root is raw material and is not served by this shell.

```bash
cd site
npm ci
npm run typecheck
npm run build          # generate-reference, next build, Pagefind, .md twins, secret-lint
  npm run generate       # rebuild reference pages from _data/reference
  npm run generate:check # fail if those pages are stale
npm run linkcheck      # against site/out
```

Next is pinned to **16.4.6**, inside the marketing range `^16.4.0`. 16.4.0 (the marketing lock) fails `next build` with Next's security gate. React is **19.2.4**, TypeScript **5.6.3**, matching marketing.

Do not deploy, change DNS, or edit nginx from this repo. Phase 2 is Infra: publish `static/docs/<sha12>` and swap the temporary 301 to serving this `out/`.

## Generated reference

`npm run build` runs `scripts/generate-reference.mjs` first. Snapshots live in `_data/reference/` and are pinned by `docs.lock.yaml` at the repo root.

- MCP tools from the server export (`docs/mcp-tools.json`)
- Organisation OpenAPI from `https://api.newtalaria.com/api/v1/openapi.json`
- RFC 9457 problem codes, CLI command tree, and SDK init options

Refresh a snapshot, run `npm run generate`, and commit both the JSON and the Markdown. `npm run generate:check` is the drift gate. Nightly lock drift is an Infra/box job, not a cron in this repo.

The build must be a **full clone**. A shallow clone makes `Last reviewed` dates misleading; the site omits those dates when `git rev-parse --is-shallow-repository` is true.
