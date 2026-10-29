---
title: Catalogue and templates
description: Define permission keys in code, ship system templates, then create tenant profiles and grant scoped assignments.
---

## Catalogue

Define `App\Access\Permission`. Keys have 2 to 4 lower-snake segments, such as `billing.refund`, `billing.invoice.void` or `billing.invoice.void.request`.

```php
use Seisigma\AccessProfiles\Contracts\PermissionCatalogue;

enum Permission: string implements PermissionCatalogue
{
    case View = 'billing.invoice.view';
    case Approve = 'billing.invoice.approve';

    public static function keys(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
```

## Templates

Define `App\Access\Templates`. Wildcards expand to exact catalogue keys at write time.

```php
use Seisigma\AccessProfiles\Contracts\TemplateDefinitions;
use Seisigma\AccessProfiles\Templates\TemplateDefinition;

class Templates implements TemplateDefinitions
{
    public static function templates(): iterable
    {
        return [new TemplateDefinition(
            key: 'reviewer',
            name: 'Invoice reviewer',
            allow: ['billing.*'],
            deny: ['billing.invoice.approve'],
        )];
    }
}
```

In `config/access-profiles.php`, set `catalogues` to `[App\Access\Permission::class]` and `templates` to `App\Access\Templates::class` before the package boots. Sync creates global system templates. Unchanged definitions keep their version. Removed templates are soft-deleted. Tenant copies are independent.

## Profiles

Import `Seisigma\AccessProfiles\Facades\Access` for the examples below. `$team`, `$site`, `$otherSite`, `$user` and `$admin` are saved host models. Both sites belong to the team. The admin already holds the profile's allow keys throughout that team.

Create a tenant copy, then adjust its rules. `copyFromTemplate()` saves immediately.

```php
$copy = Access::profile('reviewer')->in($team)
    ->by($admin)->because('Use a local review profile')->copyFromTemplate();
$profile = Access::profile('reviewer')->in($team)
    ->allow('billing.*')->deny('billing.invoice.approve')
    ->by($admin)->because('Keep approvals separate')->save();
```

## Assignments

Grant scope access. Omit `onlyScopes()` to cover the whole tenant. Start dates are inclusive; end dates are exclusive. Expiry needs no scheduler.

```php
$assignment = Access::grant('reviewer')->to($user)->in($team)
    ->onlyScopes([$site, $otherSite])->titled('Review cover')
    ->validFrom(now())->validUntil(now()->addMonths(6))
    ->by($admin)->because('Cover leave')->save();
```

Trusted seeders and backfills can use a system actor. This skips escalation and self-assignment checks. Tenant consistency, protected profiles, catalogue checks, duplicate checks and host rules still apply. This example assumes no live reviewer assignment yet.

```php
$assignment = Access::grant('reviewer')->to($user)->in($team)
    ->bySystem('seed: initial reviewer')->save();
```

Change only the fields provided. The change reason is in the event; it does not overwrite the original grant reason.

```php
$assignment = Access::change($assignment)->onlyScopes([$site])
    ->titled('Extended review cover')->validUntil(now()->addYear())
    ->by($admin)->because('Extend the cover')->save();
```

Revoke without deleting the history row.

```php
$assignment = Access::revoke($assignment)
    ->by($admin)->because('Cover ended')->save();
```

## Write-time guards

Guards reject self-assignment and escalation by default. Scopes must belong to the tenant. Rejections throw `Seisigma\AccessProfiles\Exceptions\GrantRejected` with a `reason` code.

| Guard | Rule |
|---|---|
| `no_escalation` | The grantor (`by`) must hold every **allow** key of the profile in every scope of the new assignment. |
| `no_self_assignment` | The grantor cannot grant, change or revoke their own assignments. |
| `protected_profiles` | The last active holder of a listed profile in a tenant cannot be revoked (no lock-out). |
| Tenant consistency | Every scope must belong to the tenant (`ScopeOwnership`). Always on. |
| Catalogue | Every rule key must exist in a catalogue. Always on. |
| `AssignmentRule` (contract) | Host rules. Zero or more. |
