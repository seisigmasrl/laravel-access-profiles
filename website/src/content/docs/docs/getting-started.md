---
title: Getting started
description: Install Laravel Access Profiles, publish its config and migrations, and sync your templates.
---

Laravel Access Profiles gives people different permissions in different parts of a tenant. Profiles combine allow and deny rules. Assignments cover a whole tenant or selected scopes, with validity dates and a record of who granted access and why. Any matching deny wins. Access is denied by default.

## Requirements

Requires PHP 8.3+ and Laravel 12.69+ or 13.30+. CI runs every row on its lowest and its newest allowed release.

| Package | PHP | Laravel | Testbench |
|---|---|---|---|
| 0.1.x | 8.3, 8.4, 8.5 | 12.69+ | 10.x |
| 0.1.x | 8.3, 8.4, 8.5 | 13.30+ | 11.x |

The minimums are the first Laravel releases with no open security advisory. Composer refuses older releases.

Runtime dependencies are PHP and `illuminate/*`.

## Install

1. Run `composer require seisigmasrl/laravel-access-profiles`.
2. Run `php artisan vendor:publish --tag=access-profiles-config`.
3. Run `php artisan vendor:publish --tag=access-profiles-migrations`.
4. Configure the [catalogue and templates](/docs/catalogue-and-templates/). Choose table names before migrating.
5. Run `php artisan migrate` against your intended database.
6. Run `php artisan access-profiles:sync-templates`. Run it again when deploying changed definitions.

## Config

The published file is `config/access-profiles.php`.

| Key | Default | Purpose |
|---|---|---|
| `catalogues` | `[]` | Classes implementing `PermissionCatalogue::keys()` (static). |
| `templates` | `null` | Class implementing static `TemplateDefinitions::templates()`. |
| `backfill.sources` | `[]` | Classes implementing `BackfillSource`. |
| `tables.*` | `access_profiles`, `access_profile_permissions`, `access_assignments`, `access_assignment_scopes` | Table names. |
| `cache.enabled` / `store` / `ttl` / `prefix` | `true` / default store / 24 h / `access-profiles` | Versioned cache. |
| `token_intersection` | `true` | API tokens can only narrow access. |
| `guards.no_escalation` / `no_self_assignment` / `protected_profiles` | `true` / `true` / `[]` | Write-time guards. |
| `events.access_checked` | `false` | Fire `AccessChecked` for each decision. |
| `bindings` | `[]` | Swap contract implementations. |

## Commands

Run with `php artisan`. References use `morph-type:primary-key`, such as `team:1` when your morph map registers `team`. Without a morph map, use the fully qualified model class as the type and quote the argument in your shell.

| Command | Purpose |
| --- | --- |
| `access-profiles:census` | Exit 1 for unknown stored keys. Unused catalogue keys are warnings. |
| `access-profiles:sync-templates --dry-run` | Preview changes without writes. Omit `--dry-run` to sync. |
| `access-profiles:cache-clear --tenant=team:1` | Bump one tenant's version. Omit `--tenant` for all stored tenants. |
| `access-profiles:backfill legacy --dry-run --tenant=team:1` | Preview drafts from the registered source named `legacy`. Omit `--tenant` for all source tenants. |
| `access-profiles:show user:1 team:1` | Show active assignments, scopes, validity and effective keys. |

Implement `Seisigma\AccessProfiles\Contracts\BackfillSource` with `name()`, `tenants()` and `drafts($tenant)`. Return `Seisigma\AccessProfiles\Backfill\AssignmentDraft` objects. Register source classes in `backfill.sources`. Read the dry-run report before running without `--dry-run`. Real runs use system grants, skip existing live assignments and roll back only the rejected tenant. Other tenants can commit. Any rejection gives exit 1.

## When not to use this package

- **One tenant or one flat team level.** Consider [spatie/laravel-permission](https://github.com/spatie/laravel-permission).
- **A few fixed roles.** Laravel's Gates and policies may be enough.
- **Record-level rules.** Keep rules such as “only the author edits this post” in a policy.
- **An admin UI out of the box.** Build your own screens.
- **A mature, proven package today.** This package is new. Review it before relying on it for access control.

## Next

- [Concepts](/docs/concepts/): tenant, scope, profile, assignment and the decision rules.
- [Catalogue and templates](/docs/catalogue-and-templates/): define your keys and templates.
