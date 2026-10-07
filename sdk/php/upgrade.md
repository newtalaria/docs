---
title: PHP upgrade
description: Upgrade talaria/talaria, talaria/silverstripe, and talaria/laravel with Composer. Commit the lock file, install it on deploy, and apply each version's config changes.
sdk: php
package: talaria/talaria
tags: [php, upgrade, composer, silverstripe, laravel]
---

# PHP upgrade

`talaria/talaria` 2.0.0 is the current core. `talaria/silverstripe` 2.0.1 and `talaria/laravel` 2.0.1 require that core (`^2.0.0`). PHP 8.1 or newer.

Upgrade the package your app requires and the core it depends on in one Composer command. A Silverstripe site follows [Upgrade the Silverstripe module](../silverstripe/upgrade.md) for the flush and the module's config. This page is the shared Composer procedure and the core version changes.

## See the installed version

From the application root (the directory that contains `composer.json` and `composer.lock`):

```bash
composer show talaria/talaria
composer outdated --direct "talaria/*"
```

Run `composer show` the same way for `talaria/silverstripe` or `talaria/laravel` when that package is installed. `composer show` prints the locked version. `composer outdated` prints the newest version your constraints allow. If a package name is not in the lock file, Composer says it is not found — that app does not use it.

When the solver refuses a version, ask why:

```bash
composer why-not talaria/talaria 2.0.0
```

## Update the unit you installed

| App | Already allows the target (same major, or an open `^1.0`) | Crossing into 2.0 when the constraint is still `^1.2` |
| --- | --- | --- |
| Plain PHP | `composer update talaria/talaria -W` | `composer require talaria/talaria:^2.0 -W` |
| Silverstripe | `composer update talaria/silverstripe talaria/talaria -W` | `composer require talaria/silverstripe:^2.0 talaria/talaria:^2.0 -W` |
| Laravel | `composer update talaria/laravel talaria/talaria -W` | `composer require talaria/laravel:^2.0 talaria/talaria:^2.0 -W` |

`composer update` installs the newest release that the constraint already in `composer.json` allows. `^1.2` means `>=1.2.0 <2.0.0`, so update stays on 1.x. `composer require vendor/package:^2.0` changes that constraint and updates the lock file in one step.

`-W` is `--with-all-dependencies`. Composer may update dependencies of those packages, including packages your root `composer.json` also requires. A newer adapter that needs a newer core fails to resolve without it. Use the same `-W` on `composer require` when you cross a major.

Preview the solve before writing the lock file:

```bash
composer update talaria/silverstripe talaria/talaria -W --dry-run
```

Use the package names for the app you have. Read the dry-run. Then run the same command without `--dry-run`.

Read `git diff composer.lock` before you commit. `-W` can move other libraries those packages depend on. `talaria/silverstripe` allows Silverstripe 4.13, 5, and 6, so a wide `silverstripe/framework` constraint can change the CMS major in the same solve. Keep the framework on the major you are already running. If the diff moves it, set an explicit framework constraint in the app and run the Talaria update again.

Do not run a bare `composer update` with no package names. That upgrades every dependency in the lock file.

## Test, then commit the lock file

Exercise the path that reports to Talaria: a request, a logged error, and a CLI or queue job if you use one. Silverstripe's build and flush are on the [Silverstripe upgrade](../silverstripe/upgrade.md) page. Laravel: `php artisan config:clear`, and restart Octane if the app uses it.

Commit both files. The lock file is the version you tested.

```bash
git add composer.json composer.lock
git commit -m "Upgrade Talaria dependencies"
```

`composer.json` changes when a constraint moves (for example `^1.2` to `^2.0`). `composer.lock` changes on every resolved update. UAT and production install that lock file. They do not resolve versions again.

## Deploy with install, not update

```bash
composer install --no-dev --optimize-autoloader
```

`composer install` reproduces the lock file. `composer update` on the server resolves versions again and can ship a set you did not test.

Restart PHP after the new code is on disk so OPcache loads it. A rejected API key is cached for about 24 hours in that process. Restarting is also how a rotated key is picked up.

## 1.x to 2.0.0

2.0.0 removes the `environment` init option. The API key decides the environment. Events, spans, and analytics no longer send an environment string.

- Delete `environment` from `Talaria::init([...])`.
- Delete `TALARIA_ENVIRONMENT` from the environment.
- On Silverstripe, delete the `environment` key under `Talaria\SilverStripe\Config`. Details are on the [Silverstripe upgrade](../silverstripe/upgrade.md) page.
- On Laravel, delete the `environment` key from a published `config/talaria.php` and run `php artisan config:clear`. `APP_ENV` is not a substitute.

An event that used to be labelled by that string now shows up under the key's environment (development, test, staging, or production). Use a development key locally and a production key on the deployed app. The prefix stays `tal_live_`.

`talaria/silverstripe` 2.0.0 and `talaria/laravel` 2.0.0 require `talaria/talaria` ^2.0.0. A 1.x adapter does not install against 2.0.0 core, and a 2.0 adapter does not install against 1.x core. Upgrade the pair together.

## 1.1 to 1.2.0

1.2.0 reads tracing, analytics, and the event sample rate from `POST /sdk/getConfig`. These init options no longer change that behaviour:

- `enableTracing`
- `tracesSampleRate`
- `enableAnalytics`
- `sampleRate`

Until a config document is cached, the process sends errors only. Turn tracing and analytics on in [Project settings](../../getting-started/configuration.md). A rejected key stops the process until PHP restarts.

Silverstripe YAML and `TALARIA_ENABLE_TRACING` / `TALARIA_ENABLE_ANALYTICS` are passed into init and then discarded by 1.2.0 core. The dashboard switches are the ones that apply.

## Inside 1.2 and 2.0

Stay on the newest 2.0.x. These 1.2 patch releases still matter if you are stepping through 1.x before the major:

| Version | What changes for the running app |
| --- | --- |
| 1.2.2 | Each uncaught exception is one event. The engine's "Uncaught … thrown" shutdown line is not sent again. |
| 1.2.3 | Identical SQL under one parent is one span with `db.query.count` and `db.query.duration_sum_ms`. Queries of 200ms or more, and failed queries, stay their own spans. A transaction keeps at most 200 spans. `withoutQuerySpans` turns automatic SQL spans off for one run. |
| 1.2.4 | `Talaria::flags()` (`boolVariation`, `stringVariation`, `jsonVariation`). Flag state follows `flags.enabled` in the project config. |
| 2.0.1 adapters | Silverstripe and Laravel pin `@newtalaria/browser` 0.5.3. Core stays 2.0.0. |

## Related

- [Silverstripe upgrade](../silverstripe/upgrade.md)
- [PHP SDK](README.md)
- [Project configuration](../../getting-started/configuration.md)
- [Laravel](../laravel/README.md)
