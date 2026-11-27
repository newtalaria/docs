---
title: Dart releases
description: Attach Dart events to a named release.
section: sdk
order: 66
---

Set `release` in `TalariaOptions` (or the Flutter equivalent) so events attach to the build you shipped. Upload Dart obfuscation maps or Flutter debug symbols from CI with a **secret** key — see [Releases](/guides/releases/) and [Source maps](/guides/source-maps/). CLI: `talaria releases new`, `finalize`, and `deploy`, plus `talaria sourcemaps upload`.

Related: [Dart](/sdk/dart/), [Dart configuration](/sdk/dart/configuration/).
