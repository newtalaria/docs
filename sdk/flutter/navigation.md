---
title: Navigation and screens
description: TalariaNavigatorObserver tags events with route and screen, and starts a short INTERNAL transaction that finishes on idle.
sdk: flutter
package: talaria_flutter
tags: [flutter, navigation, tracing]
---

# Navigation and screens

Add the observer to every navigator you care about — usually the root `MaterialApp` / `CupertinoApp`.

```dart
MaterialApp(
  navigatorObservers: [TalariaNavigatorObserver()],
  // …
)
```

## Route tags

On push, replace, and pop the observer sets `route` and `screen` tags and records a navigation breadcrumb. Later exceptions in that screen carry those tags.

## Short screen transactions

When tracing is on, the observer starts an `INTERNAL` transaction named after the route and finishes it on the next idle frame (10s cap). That measures page-load work without letting a shell route parent every later HTTP call.

> [!NOTE]
> Later API calls should be their own traces (via `wrapHttpClient`) or children of a transaction you start for a user action — not children of the home shell.

## IndexedStack and tabs

Hosts that swap destinations without pushing a route should call `TalariaFlutter.setScreen`:

```dart
void onDestinationSelected(int index) {
  setState(() => _index = index);
  TalariaFlutter.setScreen(switch (index) {
    0 => '/home',
    1 => '/lab',
    _ => '/settings',
  });
}
```

That applies the same tags and the same short INTERNAL span as the navigator observer.

## go_router and other delegates

- Pass `TalariaNavigatorObserver` into the navigator observers list those packages expose.
- If a custom shell never notifies `NavigatorObserver`, call `setScreen` on destination change.

Manual transactions for a user flow (checkout, onboarding) still use `startTransaction` from the Dart tracing API. Call `finish()` when the flow ends. See [Instrumentation and tracing](instrumentation.md).

## Related

- [Flutter hub](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Configuration](../../getting-started/configuration.md)
