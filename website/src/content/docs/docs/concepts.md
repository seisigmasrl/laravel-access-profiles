---
title: Concepts
description: Holders, tenants, scopes, profiles and assignments, and how the resolver decides. Any deny wins.
---

Tenants, scopes and holders are Eloquent models. A team can be a tenant and its sites can be scopes. Tenant and scope models implement `Seisigma\AccessProfiles\Contracts\HasAccessTenant`. Their `accessTenant(): Model` method returns the tenant: `$this` on a team, `$this->team` on a site.

There is no global current tenant or owner bypass. Checks always take a target.

## The problem

Many multi-tenant apps have the same shape:

- A **tenant** (an organisation, account, agency) has many **scopes** inside it (sites, buildings, stores, projects).
- One person needs **different powers in different scopes** of the same tenant: manager in two sites, read-only in a third.
- Some access is **temporary** (an external auditor until 31 March) or **appointed** ("Board treasurer").
- A broad grant sometimes needs **one hole** in it (everything in billing, except approving payments).
- Someone will ask **"who can approve payments in site 4?"** — and the answer must be a query, not a loop over every user.

## Terms

| Concept | What it is |
|---|---|
| **Holder** | Who receives access. Any Eloquent model that is `Authorizable` (normally `User`). Morph. |
| **Tenant** | The boundary that owns profiles and assignments. Any Eloquent model. Morph. |
| **Scope** | A model inside a tenant that an assignment can be limited to. Any Eloquent model. Morph. Optional. |
| **Catalogue** | Every permission key the app knows, **in code**: a backed enum implementing `PermissionCatalogue`. Keys have 2 to 4 lower-snake segments (`billing.refund`, `billing.invoice.void`, `billing.invoice.void.request`). |
| **Profile** | A named set of rules. Each rule = permission key + effect (`allow` or `deny`). |
| **System template** | A profile with `tenant = null` and `is_system = true`. Defined in code, synced to the database by a command. Read-only at runtime. |
| **Tenant copy** | A profile a tenant owns. Usually copied from a template (`based_on_id`) and then edited. |
| **Assignment** | Holder × profile × tenant × (whole tenant **or** a set of scopes) × validity window × grantor × reason × title. Revoked rows stay (history). |
| **Condition** | An optional switch on a profile (`requires_condition`, e.g. `board_approvals`). The host decides per tenant whether it is on. Off → the profile grants nothing. |

## Decision rules

For `can(holder, permission, target)` where `target` is a tenant or a scope:

1. Resolve the **tenant** of the target (`ScopeOwnership` contract; a tenant is its own tenant).
2. Load the holder's **active** assignments in that tenant: `revoked_at is null` and `valid_from <= now` (or null) and `valid_until > now` (or null) and the profile's condition is on.
3. Keep the assignments that **cover** the target: `covers_tenant = true` covers the tenant and every scope in it; `covers_tenant = false` covers only its listed scopes. A tenant-level check (target = tenant) is covered only by `covers_tenant = true`.
4. Collect the rules for `permission` from those assignments' profiles.
5. **Any deny wins.** If one covering rule says `deny`, the answer is `false`, even if another profile allows.
6. Otherwise `true` if at least one rule says `allow`. Default is `false`.
7. If the holder authenticated with an API token, also require `tokenCan(permission)`.

There is **no owner wildcard and no `Gate::before`**. A tenant owner gets access the same way as everyone else: an assignment of a full profile. The package never answers `true` because of who the holder *is*.

## Cache

- Every write (grant, revoke, profile rule change, template sync) bumps a **per-tenant version** stored in the cache store.
- Old versions are never read again and expire by TTL. No tags needed, so every cache driver works.
- The TTL is `min(config ttl, seconds until the next valid_from / valid_until boundary)` for that holder, so an expiring assignment stops working on time without a scheduler.
- If the cache store is flushed, the version and the entries go together. The next read rebuilds from the database.

## Octane and queues

- **No global tenant state.** Every call takes the tenant or scope as an argument.
- The per-request memo is a Laravel **scoped** binding, which Laravel flushes at the start of every Octane request and every queued job.
- Jobs carry the **actor** (holder) explicitly and re-check at execution time. See [Checking access](/docs/checking-access/#queues).

## Out of scope

- **No UI.** No admin panel, no Livewire/Inertia screens.
- **No record-level rules.** "Only the author may edit this post" stays in your policy.
- **No workflow rules.** Maker-checker, approval counts, separation of duties live in your actions; the package gives you `holders()` to count eligible people.
- **No role hierarchy** (profile A includes profile B). Copy a template instead.
- **No read-time wildcards.** Wildcards are expanded when a profile is saved.

For the full design, read [DESIGN.md](https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/DESIGN.md) on GitHub.
