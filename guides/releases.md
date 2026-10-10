---
title: Releases
description: Stamp every event with the git ref and commit that produced the deploy.
tags: [release, ci, github-actions, guide]
---

# Releases

A release is the deploy that produced the event. Every event, span, and analytics event inherits it from SDK init. Nothing is set per call.

The value is `<ref>@<shortsha>`:

- Branch deploy: `main@a8f31c2`, `feature/new-checkout@f32a991`
- Tag or GitHub Release: `v1.4.2@a8f31c2`

The left side is the git ref name. The right side is the first 7 characters of the commit. The full 40-character SHA is `commitSha`. The dashboard events list filters on the release string.

An explicit `release` option or `TALARIA_RELEASE` wins. A plain version such as `1.4.2` still works. When both the release and the commit SHA are empty, server SDKs fill them from the CI environment. They do not run git.

## Server runtimes

PHP, Laravel, Silverstripe, Node, Dart on a server, and Serverpod read these variables when `TALARIA_RELEASE` is unset:

| Host | Ref | Full SHA | Kind |
| ---- | --- | -------- | ---- |
| GitHub Actions | `GITHUB_REF_NAME` | `GITHUB_SHA` | `GITHUB_REF_TYPE` (`branch` or `tag`) |
| GitLab | `CI_COMMIT_REF_NAME` | `CI_COMMIT_SHA` | tag when `CI_COMMIT_TAG` is set |

A GitHub Actions job that starts the process does not need a `TALARIA_RELEASE` line. A tag push (`GITHUB_REF_TYPE=tag`) uses the tag name on the left, so a GitHub Release and a tag are the same string.

## Compiled apps

Browser, Next.js, React, and Flutter bake the same string at build time.

```yaml
name: Deploy
on:
  push:
    branches: [main]
    tags: ["v*"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Release identity
        run: |
          echo "TALARIA_RELEASE=${GITHUB_REF_NAME}@${GITHUB_SHA::7}" >> "$GITHUB_ENV"
          echo "TALARIA_COMMIT_SHA=${GITHUB_SHA}" >> "$GITHUB_ENV"

      - name: Next.js
        run: |
          NEXT_PUBLIC_TALARIA_RELEASE="$TALARIA_RELEASE" \
          NEXT_PUBLIC_TALARIA_COMMIT_SHA="$TALARIA_COMMIT_SHA" \
          npm run build

      - name: Flutter
        run: |
          flutter build web \
            --dart-define=TALARIA_RELEASE="$TALARIA_RELEASE" \
            --dart-define=TALARIA_COMMIT_SHA="$TALARIA_COMMIT_SHA"

      - name: Upload source maps
        id: maps
        uses: newtalaria/source-maps@v1
        with:
          path: dist
        env:
          TALARIA_RELEASE_KEY: ${{ secrets.TALARIA_RELEASE_KEY }}
```

`NEXT_PUBLIC_TALARIA_RELEASE` is what the Next.js client bundle inlines. Flutter reads `TALARIA_RELEASE` and `TALARIA_COMMIT_SHA` from `--dart-define`. The source-map action reads that same `TALARIA_RELEASE`, so the map and the event name the same deploy. `steps.maps.outputs.release` is that string.

GitLab is the same idea: `CI_COMMIT_REF_NAME`, `CI_COMMIT_SHA`, and `CI_COMMIT_TAG` when the pipeline is a tag. Set `TALARIA_RELEASE` yourself when you want a different string.
