---
title: Scoped queries
description: Ask who holds a permission in a scope, which scopes a holder can reach, and read assignment history.
---

`holders()` and `holdersQuery()` apply deny, scope, validity and conditions. The holder class defaults to `auth.providers.users.model`; pass a third argument for another holder type. `history()` includes revoked and expired assignments.

```php
$holders = Access::holders('billing.invoice.view', $site);
$count = Access::holdersQuery('billing.invoice.view', $site)->count();
$scopes = Access::for($user)->scopesWhere('billing.invoice.view', $team);
$allSites = $scopes->coversTenant();
$siteIds = $scopes->ids(Site::class);
$sites = $scopes->constrain(
    Site::query()->where('team_id', $team->getKey()), 'id', Site::class,
)->get();
$history = Access::history($user, $team);
```

:::caution
Always limit the base query to the tenant yourself.
:::

`constrain()` adds no restriction when access covers every scope. It returns no rows for an empty set. A tenant-wide allow with scope denies uses exclusions; `exceptIds(Site::class)` lists them. Then `coversTenant()` is false and `ids()` is empty; use `constrain()` to apply the exclusions.
