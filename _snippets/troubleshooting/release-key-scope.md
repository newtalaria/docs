**Cause:** The upload step used a publishable key (`tal_pk_…`), which cannot hold `releases:write`.

**Fix:** Set `TALARIA_RELEASE_KEY` to a secret key (`tal_sk_…`) with `releases:write`.
