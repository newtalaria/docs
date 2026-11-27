---
title: Flutter configuration
description: Publishable-key init, dart-define, and heatmap privacy.
section: sdk
order: 71
---

Pass the publishable key with `--dart-define=TALARIA_BROWSER_API_KEY=tal_pk_…`. Init options match the [Dart core](/sdk/dart/configuration/) (`release`, `minLevel`, `url`). Tracing, analytics, and heatmaps follow [project settings](/get-started/project-settings/).

Wrap the app once to enable screen heatmaps when the project allows them:

```dart
TalariaScreenCapture(
  child: MaterialApp(
    navigatorObservers: [TalariaNavigatorObserver()],
    home: const HomePage(),
  ),
)
```

Continuous capture is taps and scroll depth only (no periodic screenshots). Password fields are covered. `TalariaHeatmapPrivacy`, `TalariaMask`, and `TalariaUnmask` control what is stored. `TalariaHeatmapAnchor` or `Semantics(identifier: …)` give a control a stable id. Typed field values are not stored.

On Flutter Web, capture uses the same API (CanvasKit / Skwasm). There is no DOM snapshot path.
