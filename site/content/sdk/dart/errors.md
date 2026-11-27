---
title: Dart errors
description: captureException and captureMessage on the Dart VM.
section: sdk
order: 62
---

```dart
await Talaria.captureException(error, stackTrace: stackTrace);
await Talaria.captureMessage('Payment retry limit reached', level: SeverityLevel.warning);
```

A disabled client returns normally and sends nothing. Transport errors (401, 5xx, timeouts, network) are swallowed and logged at most once a minute per channel. See [fail-safe](/get-started/fail-safe/).
