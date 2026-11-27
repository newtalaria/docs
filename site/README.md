# Talaria docs site

The greenfield static site for `https://docs.newtalaria.com`. Plan: `talaria-workspace` `docs/architecture/docs-site/PLAN.md`.

This directory is the Next.js App Router app (`output: "export"`). Author new-IA pages in `content/`. Existing Markdown at the repo root is raw material and is not served by this shell.

```bash
cd site
npm ci
npm run typecheck
npm run build          # also runs Pagefind, writes .md twins, secret-lints
npm run linkcheck      # against site/out
```

Next is pinned to **16.4.6**, inside the marketing range `^16.4.0`. 16.4.0 (the marketing lock) fails `next build` with Next's security gate. React is **19.2.4**, TypeScript **5.6.3**, matching marketing.

Do not deploy, change DNS, or edit nginx from this repo. Phase 2 is Infra: publish `static/docs/<sha12>` and swap the temporary 301 to serving this `out/`.
