---
title: Releases
description: Name a release, create it from CI, and record a deploy so issues and source maps attach to the right build.
section: guides
order: 120
---

A release is the build you shipped. Official SDKs send it on events and spans. Source maps and debug symbols upload under the same name. Deploys record when that release reached an environment.

## Release names

The name must match `^[A-Za-z0-9][A-Za-z0-9._+@-]{0,199}$`. Slashes are not allowed. If your git ref contains `/` (for example `feature/new-checkout`), replace each `/` with `-` (`feature-new-checkout@a1b2c3d`).

A common form is `<ref>@<shortsha>`. Set `TALARIA_RELEASE` to pin the value; when it is unset, official SDKs that detect CI use that form from well-known variables.

| CI | Ref | SHA |
| --- | --- | --- |
| GitHub Actions | `GITHUB_REF_NAME` | `GITHUB_SHA` |
| GitLab CI | `CI_COMMIT_REF_NAME` | `CI_COMMIT_SHA` |

The short SHA is the first seven characters. PHP and Laravel follow this when `TALARIA_RELEASE` is unset. Next.js uses `TALARIA_RELEASE`, or `<branch>@<sha7>` from the same CI variables, inlined as `NEXT_PUBLIC_TALARIA_RELEASE`.

## Create a release and record a deploy

A secret key with `releases:write` can call `POST /v1/releases` and `POST /v1/deploys` on `https://ingest-nz1.newtalaria.com`. A deploy is idempotent per project, release, environment, and `deployedAt` truncated to the UTC minute.

The Go CLI (from [get.newtalaria.com/cli](https://get.newtalaria.com/cli)) records a deploy with:

```bash
talaria releases deploy --env production
```

See the [CLI](/cli/) and [Ingest API](/reference/ingest-api/).

## Source maps

JavaScript maps and Dart or Flutter symbols attach to the release name. The Next.js plugin uploads maps at build time when `TALARIA_RELEASE_KEY` is set. Otherwise use `talaria sourcemaps upload` (Go CLI) or `npx talaria source-maps upload` (`@newtalaria/cli`). Details: [Source maps](/guides/source-maps/) and [Next.js](/sdk/javascript/nextjs/).

There is no published `newtalaria/release` GitHub Action. Call the CLI from your existing workflow.

## Related

- [Project settings](/get-started/project-settings/)
- [CI](/deploy/ci/)
