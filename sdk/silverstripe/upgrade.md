---
title: Silverstripe upgrade
description: Upgrade talaria/silverstripe and talaria/talaria together, flush the manifest, and handle the 1.x and 2.0 config changes.
sdk: silverstripe
package: talaria/silverstripe
tags: [silverstripe, php, upgrade, composer, flush]
---

# Silverstripe upgrade

`talaria/silverstripe` 2.0.1 requires `talaria/talaria` ^2.0.0. Treat them as one unit:

```text
talaria/silverstripe
        │
        └── requires → talaria/talaria
```

When a new module release requires a newer core, upgrade both in the same Composer command. The shared rules for the lock file and for `composer install` on deploy are in [PHP upgrade](../php/upgrade.md). This page is the Silverstripe sequence and the config that has to change with it.

The module supports Silverstripe 4.13, 5, and 6 on PHP 8.1 or newer. Do not call `Talaria::init()` in application code. Injector builds the client.

## Upgrade

Run this from the application root, the project that owns `composer.json` and `composer.lock`. Not from inside `vendor/`.

```bash
composer show talaria/silverstripe
composer show talaria/talaria
composer update talaria/silverstripe talaria/talaria -W --dry-run
composer update talaria/silverstripe talaria/talaria -W
```

`-W` (`--with-all-dependencies`) lets Composer update dependencies required by the packages you are upgrading. That is what a failed solve is asking for when the new module needs a newer `talaria/talaria`, or a newer library the core now requires, and the lock file still has the old one.

`composer update` will not cross from 1.x into 2.0 while `composer.json` says `^1.2` (`>=1.2.0 <2.0.0`). Change the constraint and update the lock together:

```bash
composer require talaria/silverstripe:^2.0 talaria/talaria:^2.0 -W
```

Inside 2.0, the `composer update … -W` command is the one that moves you to 2.0.1.

Read `git diff composer.lock`. `-W` can move other packages. `silverstripe/framework` should stay on the major you already run. The Talaria constraint allows 4.13, 5, and 6, so an unbounded framework requirement can change the CMS in the same solve. Pin `silverstripe/framework` to your major, then run the Talaria update again.

On Silverstripe 4, leave `monolog/monolog` on 1.x or 2.x and leave `psr/log` able to resolve 1.x. A root constraint of `psr/log: ^3` or `monolog/monolog: ^3` does not install against Silverstripe 4. The module loads one Monolog handler: `TalariaLogHandlerMonolog3` on Monolog 3 (Silverstripe 5 and 6), `TalariaLogHandlerMonologLegacy` on Monolog 1 and 2 (Silverstripe 4). Those classes are excluded from Composer's classmap and are not both loaded. Do not add your own `TalariaLogHandler` class, and do not point an Injector service at a concrete handler class name. The service id is `talariaLogHandler`.

`silverstripe/vendor-plugin` has to stay allowed (`composer config allow-plugins.silverstripe/vendor-plugin true`). If that plugin is blocked, the module's `_config` YAML is not applied and the logger handler never registers.

## Flush and test

```bash
vendor/bin/sake dev/build flush=all
```

`dev/build` builds the database. `flush=all` clears the manifest cache, so the new module YAML (Injector services, browser version, removed keys) replaces the cached copy. Run that command as the same system user that serves the site. A flush owned by another user leaves the web process on the old manifest. If the site still behaves as the previous module, delete the `silverstripe-cache` directory the web user reads and flush again.

Then use the site. Log an error through the framework logger, or throw, and open a public HTML page and a CMS page. Confirm with MCP `search_errors` and `environment: development` when the key is a development key. A page with no browser script usually means `enableBrowserFrontend` is false, the response is not HTML, or `TALARIA_BROWSER_API_KEY` is set to something that is not a `tal_live_` key. A non-empty browser key in the wrong shape disables browser inject.

Restart PHP-FPM after the code is deployed so OPcache loads the new files. A rejected key stays cached for about 24 hours until that restart.

The module reads keys through Silverstripe's environment, including `.env`. A variable exported only in your shell is visible to that shell and not to PHP-FPM. Set `TALARIA_API_KEY` where the web SAPI loads it. If the key or DSN is missing, Injector installs a disabled client and `error_log` records that. Install and flush still complete.

## Commit the lock file

```bash
git add composer.json composer.lock
git commit -m "Upgrade Talaria dependencies"
```

Commit both files. `composer.lock` is the exact set you just flushed and clicked through. UAT and production should install that set:

```bash
composer install --no-dev --optimize-autoloader
```

Do not run `composer update` on deploy. `composer install` reproduces the lock file.

## 1.x to 2.0

2.0.0 removes the `environment` setting and `TALARIA_ENVIRONMENT`. Browser init no longer sends `environment`. The API key decides the environment.

Delete this from your YAML if it is still there:

```yaml
Talaria\SilverStripe\Config:
  environment: '`TALARIA_ENVIRONMENT`'
```

Delete `TALARIA_ENVIRONMENT` from `.env`. Leaving the key does not select an environment. Events land on the key's environment. Use a development key on a laptop and a production key on the live site.

2.0.0 requires `talaria/talaria` ^2.0.0 and pins `@newtalaria/browser` 0.5.0. 2.0.1 moves that pin to **0.5.3**. An application YAML value for `browserSdkVersion` replaces the module default. If you pinned an older browser SDK (for example `0.4.1`), the PHP upgrade does not change the script until you remove that line or set `0.5.3`. The script URL is `https://cdn.jsdelivr.net/npm/@newtalaria/browser@{version}/+esm`, so the version in YAML is the version the browser loads.

## 1.1 to 1.2.0

1.2.0 requires `talaria/talaria` ^1.2.0. Tracing, analytics, heatmaps, and replay follow the project config document, not YAML.

These stop controlling the client once core is 1.2.0 or newer, even if your YAML or `.env` still sets them:

- `enableTracing` and `TALARIA_ENABLE_TRACING`
- `tracesSampleRate` and `TALARIA_TRACES_SAMPLE_RATE`
- `enableAnalytics` and `TALARIA_ENABLE_ANALYTICS`
- `sampleRate`

Turn the features on in [Project settings](../../getting-started/configuration.md). Public pages can send browser analytics when that document allows it. The CMS is not opted into browser analytics. Until the first document is cached, PHP sends errors only.

1.1.0 was the release that added `enableAnalytics` (default off) and Member `userId` for PHP analytics. After 1.2.0 that YAML flag is not the switch.

## Patch releases

| Module | Requires core | What you will notice |
| --- | --- | --- |
| 1.0.0 | `^1.0` | First `talaria/silverstripe` release. Injector, Monolog, browser inject, request / MySQL / Guzzle / queued jobs. |
| 1.1.0 | `^1.1.1` | `enableAnalytics` / `TALARIA_ENABLE_ANALYTICS` (default off) and Member `userId` on PHP analytics. Browser SDK 0.2.2. Superseded as a switch in 1.2.0. |
| 1.1.1 | `^1.1.1` | Default browser SDK 0.3.0. |
| 1.2.0 | `^1.2.0` | Browser SDK 0.4.0. Project settings own tracing, replay, analytics, and heatmaps. |
| 1.2.1 | `^1.2.0` | An empty DSN becomes `https://ingest.newtalaria.com`. Browser SDK 0.4.1. |
| 1.2.2 | `^1.2.2` | An uncaught exception logged by Monolog is one event, with frames. The shutdown line is not a second event. |
| 1.2.3 | `^1.2.3` | Optional `browserApiKey` / `TALARIA_BROWSER_API_KEY`. MySQL uses the shared SQL span helper (`db.query.count`, `withoutQuerySpans`). |
| 2.0.0 | `^2.0.0` | `environment` removed. Browser SDK 0.5.0. |
| 2.0.1 | `^2.0.0` | Browser SDK 0.5.3. |

From 1.2.1, a blank `TALARIA_DSN` sends to Talaria Cloud. Set `dsn` in YAML, or `TALARIA_DSN`, when the API is somewhere else. If PHP talks to a host the browser cannot reach (a Docker-internal URL, or HTTP behind an HTTPS site), set `TALARIA_BROWSER_DSN` for the injected script only. PHP keeps its own DSN.

`TALARIA_BROWSER_API_KEY` is optional. When it is a `tal_live_` key, CMS and public pages report with that key and PHP keeps `TALARIA_API_KEY`. When it is unset, the script uses the PHP key. When it is non-empty and not a `tal_live_` key, the script is not injected.

Query spans from 1.2.3 roll identical SQL into one span under the same parent. A waterfall that used to show one bar per query now shows a count. Queries of 200ms or more, and failed queries, stay separate. A transaction stores at most 200 spans.

MySQL wrapping is an Injector replacement of `MySQLDatabase` that runs after the `#databaseconnectors` fragment. If your own YAML replaces `MySQLDatabase` after `#talaria-tracing`, that replacement is the class that runs, and query spans are not recorded. Keep Talaria's replacement, or subclass `Talaria\SilverStripe\TracingMySQLDatabase`.

Queued-job spans load only when `symbiote/silverstripe-queuedjobs` is installed. The job service class is not in the Composer classmap until that module is present.

## Related

- [PHP upgrade](../php/upgrade.md)
- [Silverstripe SDK](README.md)
- [Instrumentation and tracing](instrumentation.md)
- [Project configuration](../../getting-started/configuration.md)
