---
title: Flutter
description: Install talaria_flutter 0.3.1 and bootstrap with a publishable key.
section: sdk
order: 70
---

`talaria_flutter` **0.3.1** re-exports [`talaria`](/sdk/dart/). Flutter init accepts only a publishable `tal_pk_…` key, from `--dart-define=TALARIA_BROWSER_API_KEY`. A `tal_sk_` or `tal_mon_` key disables Talaria with one warning. The app still runs, and no error hooks are installed.

```yaml
dependencies:
  talaria_flutter: ^0.3.1
```

```dart
import 'package:flutter/material.dart';
import 'package:talaria_flutter/talaria_flutter.dart';

Future<void> main() async {
  await TalariaFlutter.runZonedApp(
    TalariaOptions(
      apiKey: const String.fromEnvironment('TALARIA_BROWSER_API_KEY'),
      minLevel: SeverityLevel.warning,
    ),
    const MyApp(),
  );
}
```

Pass `TalariaNavigatorObserver` on `MaterialApp`. Leave `url` unset to use `https://ingest-<cell>.newtalaria.com`. See [configuration](/sdk/flutter/configuration/), [errors](/sdk/flutter/errors/), [tracing](/sdk/flutter/tracing/), [navigation](/sdk/flutter/navigation/), and [troubleshooting](/sdk/flutter/troubleshooting/).
