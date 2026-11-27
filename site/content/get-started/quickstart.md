---
title: Quickstart
description: Create an account and project, then send your first event in a few minutes.
section: get-started
order: 15
---

## Create a project

Sign in at [one.newtalaria.com](https://one.newtalaria.com), create a project, and copy the right key:

- Browser and mobile: a publishable key, `tal_pk_<env>_<cell>_…`
- Servers and collectors: a secret key, `tal_sk_<env>_<cell>_…`, stored only in environment variables

## Send an event

Pick your platform from the [SDK hub](/sdk/) and init the SDK once, before the rest of the app runs. This browser example uses a placeholder — replace it with your publishable key, never a secret:

```javascript
import { Talaria } from "@newtalaria/browser";

Talaria.init({
  key: "tal_pk_…",
});

throw new Error("Talaria quickstart");
```

## Confirm it arrived

Open **Issues** in the dashboard, or ask an agent to call MCP `search_issues` with `environment: development`. The development key from project setup selects that environment automatically.

Next: [JavaScript SDK](/sdk/javascript/) or a [collector guide](/guides/).
