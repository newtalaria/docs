---
title: PHP tracing
description: Optional tracing in the core PHP SDK, plus Laravel and Silverstripe adapters.
section: sdk
order: 93
---

Tracing follows [project settings](/get-started/project-settings/). The core package can wrap PDO, mysqli, and Redis when you use the official tracing helpers (`Talaria\Tracing\TracingPdo`, `TracingMysqli`, `RedisInstrumentation::wrap()` — suggested extensions in the package). Laravel and Silverstripe adapters instrument requests, databases, and queues for you — see [Laravel](/sdk/laravel/) and [Silverstripe](/sdk/silverstripe/).
