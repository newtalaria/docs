---
title: Serverpod
description: Install talaria_serverpod 0.3.3 and wire the database interceptor.
section: sdk
order: 80
---

`talaria_serverpod` **0.3.3** is the Serverpod 4 adapter. It re-exports the core API. Add both `talaria` **^0.4.1** and `talaria_serverpod` **^0.3.3**. The package requires Serverpod **^4.1.0** (0.3.3 is compatible with 4.1.2).

```yaml
dependencies:
  talaria: ^0.4.1
  talaria_serverpod: ^0.3.3
  serverpod: ^4.1.0
```

Pass `databaseInterceptor` to the `Serverpod` constructor — Serverpod does not allow swapping it later. `interceptDatabase` is a no-op until `TalariaServerpod.init` and until tracing is on.

```dart
final pod = Serverpod(
  args,
  Protocol(),
  Endpoints(),
  databaseInterceptor: TalariaServerpod.interceptDatabase,
  experimentalFeatures: ExperimentalFeatures(
    diagnosticEventHandlers: [
      AsEventHandler<ExceptionEvent>((event, {required space, required context}) {
        TalariaServerpod.handleExceptionEvent(event);
      }),
    ],
  ),
);

await TalariaServerpod.init(TalariaOptions(
  apiKey: 'tal_sk_prod_nz1_…',
  release: '1.2.3',
  minLevel: SeverityLevel.warning,
  tags: {'service': 'my_api'},
));

TalariaServerpod.attach(pod);
await pod.start();
```

Use a secret key. Init never throws (D19): a disabled client skips the outbound HTTP patch, `attach` adds no middleware, and hooks pass through. See [configuration](/sdk/serverpod/configuration/), [errors](/sdk/serverpod/errors/), and [tracing](/sdk/serverpod/tracing/).
