---
title: Checking access
description: Check access with Access, canAccess and Blade, and use it from Inertia, policies and queued jobs.
---

## Holder trait

Add the trait to your holder model. It adds `canAccess()` and the `accessAssignments()` morph relation. Laravel's `$user->can()` and Gate keep their normal behaviour.

```php
use Illuminate\Foundation\Auth\User as Authenticatable;
use Seisigma\AccessProfiles\Concerns\HasAccessProfiles;

class User extends Authenticatable
{
    use HasAccessProfiles;
}
```

## Checks

These checks assume an active reviewer assignment limited to `$site`. Approval remains denied by the profile.

```php
$allowed = Access::for($user)->can('billing.invoice.view', $site);
$sameAnswer = $user->canAccess('billing.invoice.view', $site);
$decision = Access::for($user)->explain('billing.invoice.approve', $site);
$keys = Access::for($user)->permissionsIn($site);
Access::for($user)->authorize('billing.invoice.view', $site);
```

`authorize()` throws Laravel's `AuthorizationException` when denied. For real API tokens, `token_intersection` also requires `tokenCan($key)`. Tokens can only narrow access. Optional profile conditions are evaluated at check time. An off condition ignores both allow and deny rules in that profile.

## Blade

Blade uses the authenticated user. Guests cannot see the block.

```blade
@canAccess('billing.invoice.view', $site)
View invoices
@endcanAccess
```

## Inertia

In your host's `HandleInertiaRequests::share()`, share keys for the current scope. Earlier middleware must resolve a `Site` into the request attribute `currentScope`. Import `Illuminate\Http\Request` and the `Access` facade. The package has no Inertia dependency.

```php
public function share(Request $request): array
{
    $currentScope = $request->attributes->get('currentScope');

    return [
        ...parent::share($request),
        'access' => $request->user() && $currentScope
            ? Access::for($request->user())->permissionsIn($currentScope)
            : [],
    ];
}
```

## Policies

Keep workflow rules in a policy. Here `Invoice` is a host model with a `site` relation and an `isPending()` method. Its approval profile must allow the key without a covering deny.

```php
public function approve(User $user, Invoice $invoice): bool
{
    return $user->canAccess('billing.invoice.approve', $invoice->site)
        && $invoice->isPending()
        && $invoice->created_by !== $user->id;
}
```

## Queues

Jobs carry their actor and scope. Recheck when executing so a grant revoked after dispatch is honoured. Import the host `User` and `Site` models and the `Access` facade. Put export work after `authorize()`.

```php
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class ExportInvoices implements ShouldQueue
{
    use SerializesModels;

    public function __construct(public User $actor, public Site $site) {}

    public function handle(): void
    {
        Access::for($this->actor)->authorize('billing.invoice.view', $this->site);
        // Export invoices here.
    }
}
```
