# Phase 1 spike: Fumadocs vs a plain App Router shell

Recorded 27 November 2026 (Pacific/Auckland) in `/tmp/task-docs-p1/spike-fumadocs`.

## What we tried

Official `create-fumadocs-app@16.3.10` with `--template +next+fuma-docs-mdx+static --search orama`. Default pins: Next 16.4.6, React 19.3.1, TypeScript 7, fumadocs-ui/core 16.19.7, fumadocs-mdx 15.6.4, Tailwind 4. `output: "export"` is already set.

## Results

- **Static export works.** `next build` on the unmodified template emitted `out/` (home, `/docs`, `/docs/test`, `/api/search` as Orama `staticGET`, `/llms.txt`, `/llms.mdx/docs.md`, OG PNGs) in about 8 seconds. No Node server required.
- **Pinned to marketing versions.** Next 16.4.0 + React 19.2.4 + TypeScript 5.6.3 still compiled the pages, then **Next 16.4.0 aborted** with `SecurityFatalError` recommending an upgrade. Marketing `package.json` is `next: ^16.4.0` (lock 16.4.0). The secure patch **16.4.6** stays inside that range. Official Fumadocs also wants React 19.3 and TS 7; those would be unasked upgrades, and `@types/react-dom@19.3` conflicts with `@types/react@19.2`.
- **Search is Orama, not Pagefind.** Fumadocs closed a Pagefind request in 2024 in favour of Orama (`fuma-nama/fumadocs#858`). ADR-31 requires Pagefind. Grafting Pagefind means replacing their search UI and dropping `/api/search`.
- **`.md` twins are not at the page URL.** The template emits `/llms.mdx/docs/test.md`, not `/docs/test.md`. Fixable in a postbuild copy, but not provided.
- **Look and IA.** Fumadocs UI is its own visual system (Tailwind 4, `base-ui`). The plan requires the Talaria DS (Geist, existing tokens), not a third look. The template also nests pages under `/docs`, which our IA forbids.

## Decision

**Use a plain Next.js App Router shell** with `output: "export"`, Next 16.4.6, React 19.2.4, TypeScript 5.6.3, Geist, DS tokens, Pagefind, and build-time `.md` twins at the page URL. Keep Fumadocs ideas (llms routes later, `generateStaticParams`, static MDX) without taking the UI or Orama.

Rejected: shipping Fumadocs UI as the product shell; extracting the marketing `next-docs` renderer; Orama or Algolia; unasked React 19.3 / TypeScript 7 upgrades.
