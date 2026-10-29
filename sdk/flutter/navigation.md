---
title: Flutter navigation and screens
description: >-
  Track screen navigation and short transactions with TalariaNavigatorObserver
  in Flutter.
package: talaria_flutter
tags:
  - flutter
  - navigation
  - tracing
id: flutter-navigation
navTitle: Navigation
type: guide
section: platforms
platform:
  - flutter
feature:
  - performance
order: 40
lastReviewed: '2026-10-29'
owner: docs
---
# Navigation and screens

## What you're setting up

Add the observer to every navigator you care about — usually the root `MaterialApp` / `CupertinoApp`.

```dart
MaterialApp(
  navigatorObservers: [TalariaNavigatorObserver()],
  // …
)
```

## Steps

### 1. Route tags

On push, replace, and pop the observer sets `route` and `screen` tags and records a navigation breadcrumb. Later exceptions in that screen carry those tags.

### 2. Short screen transactions

When tracing is on, the observer starts an `INTERNAL` transaction named after the route and finishes it on the next idle frame (10s cap). That measures page-load work without letting a shell route parent every later HTTP call.

> [!NOTE]
> Later API calls should be their own traces (via `wrapHttpClient`) or children of a transaction you start for a user action — not children of the home shell.

### 3. IndexedStack and tabs

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

### 4. go_router and other delegates

- Pass `TalariaNavigatorObserver` into the navigator observers list those packages expose.
- If a custom shell never notifies `NavigatorObserver`, call `setScreen` on destination change.

Manual transactions for a user flow (checkout, onboarding) still use `startTransaction` from the Dart tracing API. Call `finish()` when the flow ends. See [Instrumentation and tracing](tracing.md).

## Check it worked

Follow the verification on this platform's [overview](README.md).

## Next steps

- [Flutter hub](README.md)
- [Instrumentation and tracing](tracing.md)
- [Configuration](../../get-started/project-settings.md)
