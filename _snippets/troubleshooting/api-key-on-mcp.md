**Cause:** The client sent an API key or a monitor token to `/mcp`.

**Fix:** Use OAuth or a personal token. Publishable (`tal_pk_…`) and secret (`tal_sk_…`) keys never work on `/mcp`.
