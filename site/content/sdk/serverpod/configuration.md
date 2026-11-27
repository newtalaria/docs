---
title: Serverpod configuration
description: Init, attach, skip paths, and shutdown flush.
section: sdk
order: 81
---

`TalariaServerpod.init` takes the same `TalariaOptions` as [Dart](/sdk/dart/configuration/). `attach` registers a shutdown task that flushes spans when the server stops. If you shut down another way: `await Talaria.flush(); await Talaria.close();`.

Skip more routes with `TalariaServerpod.attach(pod, skip: (url) => url.path.startsWith('/internal/'))`. To mount the middleware yourself, use `talariaRelicMiddleware`.

A `tal_pk_` key logs one warning. Leave `url` unset on Talaria Cloud.
