---
title: PHP errors
description: captureException and captureMessage in PHP.
section: sdk
order: 92
---

```php
Talaria::captureException($exception);
Talaria::captureMessage('Payment retry limit reached', 'warning');
```

A disabled client is a no-op. See [fail-safe](/get-started/fail-safe/).
