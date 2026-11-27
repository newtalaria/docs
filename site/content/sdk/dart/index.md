---
title: Dart
description: Install talaria 0.4.1 and initialise with a server key.
section: sdk
order: 60
---

`talaria` **0.4.1** is the official Dart SDK. Flutter apps should use [`talaria_flutter`](/sdk/flutter/). Serverpod 4 servers should add [`talaria_serverpod`](/sdk/serverpod/).

## Install

```yaml
dependencies:
  talaria: ^0.4.1
```

## Initialise

```dart
import 'dart:io';

import 'package:talaria/talaria.dart';

Future<void> main() async {
  await Talaria.init(TalariaOptions(
    apiKey: Platform.environment['TALARIA_API_KEY'] ?? '',
    release: '1.4.2',
    minLevel: SeverityLevel.warning,
  ));
  // Start your app here.
}
```

Use a secret `tal_sk_…` key (`TALARIA_API_KEY`) on the Dart VM. The key's cell selects `https://ingest-<cell>.newtalaria.com` unless `url` or `TALARIA_URL` is set. A `self` cell without one of those disables Talaria.

Init never throws.

## Verify

```dart
await Talaria.captureException(Exception('Talaria test error'), stackTrace: StackTrace.current);
```

Run this once, then open **Issues** in the [dashboard](https://one.newtalaria.com). The test error shows as a new issue in the key's environment. Nothing there? See [fail-safe](/get-started/fail-safe/).

## Next

See [fail-safe](/get-started/fail-safe/), [configuration](/sdk/dart/configuration/), [errors](/sdk/dart/errors/), and [tracing](/sdk/dart/tracing/).
