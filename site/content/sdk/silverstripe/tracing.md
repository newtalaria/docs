---
title: Silverstripe tracing
description: Optional request, database, and queued-job tracing.
section: sdk
order: 113
---

Request, database, and queue tracing follow [project settings](/get-started/project-settings/). `symbiote/silverstripe-queuedjobs` can produce producer/consumer spans through `TracingQueuedJobService` when that package is installed. File logs from the [SiteHost collector](/guides/collectors/sitehost/) are separate from these SDK spans.
