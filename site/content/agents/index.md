---
title: MCP and agent skills
description: Set up Talaria with an agent, then instrument, triage, and verify a fix.
section: agents
order: 10
---

Point your coding agent at Talaria instead of pasting a secret into chat.

- **Docs MCP:** `search_docs` and `get_doc` read the same pages as this site. A full `llms.txt` and per-page `.md` twins ship in later phases; this shell already emits a Markdown file at each page URL (for example `/sdk/javascript.md`).
- **Skills:** Cursor and Grok Bot can use the Talaria plugin skills (get-started → instrument → observe-performance → triage-issue → verify-fix).
- **Keys:** browser and mobile code takes a publishable `tal_pk_…` key. Servers take a secret `tal_sk_…` key that never ships to a client.

Existing client notes live in the repo under `agents/mcp/` and will be rewritten here in the content wave.
