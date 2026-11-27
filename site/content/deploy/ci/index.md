---
title: CI
description: Record a release and upload symbols from CI without putting secrets in the repository.
section: deploy
order: 20
---

Use a **secret** key in the CI environment (`TALARIA_API_KEY` or, for map uploads, a key with `releases:write` as `TALARIA_RELEASE_KEY`). Never write the value into the repo or a public log.

## CLI

```bash
talaria releases new
talaria sourcemaps upload
```

`talaria sourcemaps upload` uploads JavaScript `*.js.map` files, Flutter web maps, Dart obfuscation maps, and `.symbols` files. `talaria releases` records a release, its commits, and a deploy.

## Next.js

The `@newtalaria/nextjs` plugin can create a release and upload `.next/static` maps after `next build` when `TALARIA_RELEASE_KEY` is set. A failed upload never fails the build. See [Next.js](/sdk/javascript/nextjs/).

## Official SDK CI defaults

PHP and Laravel send `<ref>@<shortsha>` from GitHub Actions or GitLab when `TALARIA_RELEASE` is unset. Next.js inlines `NEXT_PUBLIC_TALARIA_RELEASE` and `NEXT_PUBLIC_TALARIA_COMMIT_SHA` from well-known CI variables.
