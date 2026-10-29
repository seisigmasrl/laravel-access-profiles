# Design pack — Laravel Access Profiles landing page

You design the home page of a website for an open-source Laravel package. One page, light and dark.
Use ONLY the facts, code and links in this pack. Do not invent numbers, users, stars, downloads, logos, quotes or links.

## The product (facts)
- Name on the site: **Access Profiles**. Composer package: `seisigmasrl/laravel-access-profiles`. Namespace `Seisigma\AccessProfiles`.
- Version **0.1.0**, released **2026-10-28**, on Packagist. License **MIT**. Author: Ricardo A. Vargas R. (Seisigma SRL).
- Requires **PHP 8.3+** and **Laravel 12.69+ or 13.30+**. Runtime dependencies: PHP and 8 `illuminate/*` packages only.
- What it does: gives people different permissions in different parts of a tenant. Profiles combine allow and deny rules. Assignments cover a whole tenant or selected scopes, with validity dates and a record of who granted access and why. Any matching deny wins. Access is denied by default.
- Tenants, scopes and holders are your own Eloquent models. A team can be a tenant and its sites can be scopes.
- It works next to Laravel's Gate, not instead of it. `$user->can()` and Gate keep their normal behaviour; your policies call `canAccess()`.
- New package: no users, stars or testimonials yet. Do NOT show any social proof, counters or logo walls.

## Words
- Tagline / hero headline: **Different permissions in different parts of a tenant.**
- Hero subline (you may shorten): Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.
- Use the package's words: tenant, scope, holder, profile, assignment, allow, deny, grant, revoke.
- Voice: safe, precise, calm. Plain English, short sentences. No hype words (blazing, revolutionary, magic, effortless, supercharge, next-gen, enterprise-grade, bulletproof), no exclamation marks, no emoji.
- Never use words from any one industry. Examples use team / site / billing only.

## The problem (section "The problem")
- Manager in two sites, read-only in a third — same person, same tenant.
- Temporary access (an external auditor until a date) and appointed access (a title such as "Board treasurer").
- A broad grant with one hole: everything in billing, except approving payments.
- "Who can approve payments in site 4?" must be a query, not a loop over every user.
- "Who gave this person access, and why?"

## Value points (strongest first; each has a test in the repo)
1. **Access per scope set, not per tenant.** One assignment covers the whole tenant or a chosen list of scopes.
2. **Deny wins. Default is no.** Any matching deny beats every allow, in any order. With no rule, the answer is false.
3. **Access that ends on time, without a scheduler.** Start dates are inclusive, end dates exclusive. The cache TTL stops at the next boundary.
4. **Who, why, and when — on every grant.** Each assignment stores the grantor and the reason. Revoked rows stay as history. Write events fire after commit.
5. **"Who can do X here?" is one query.** `Access::holders()` applies deny, scope, validity and conditions, and returns a builder you can paginate.
6. **Safe grants by default.** Guards reject self-assignment and escalation. Scopes must belong to the tenant. Rejections write nothing.
7. **No global tenant state, no owner bypass.** Every check takes a target. Safe with Octane and queued jobs. Owners get a full profile like anyone else.
8. **Small footprint, tested docs.** PHP and `illuminate/*` only. Every README example has a behaviour test.

## Code (copy exactly; do not change a character)
File label `grant.php`:
```php
$assignment = Access::grant('reviewer')->to($user)->in($team)
    ->onlyScopes([$site, $otherSite])->titled('Review cover')
    ->validFrom(now())->validUntil(now()->addMonths(6))
    ->by($admin)->because('Cover leave')->save();
```
File label `profile.php`:
```php
$profile = Access::profile('reviewer')->in($team)
    ->allow('billing.*')->deny('billing.invoice.approve')
    ->by($admin)->because('Keep approvals separate')->save();
```
File label `check.php`:
```php
$allowed = Access::for($user)->can('billing.invoice.view', $site);
$sameAnswer = $user->canAccess('billing.invoice.view', $site);
$decision = Access::for($user)->explain('billing.invoice.approve', $site);
```
File label `query.php`:
```php
$holders = Access::holders('billing.invoice.view', $site);
$count = Access::holdersQuery('billing.invoice.view', $site)->count();
$history = Access::history($user, $team);
```
File label `Blade`:
```blade
@canAccess('billing.invoice.view', $site)
View invoices
@endcanAccess
```

## Install (each command gets a copy button)
1. `composer require seisigmasrl/laravel-access-profiles`
2. `php artisan vendor:publish --tag=access-profiles-config`
3. `php artisan vendor:publish --tag=access-profiles-migrations`
4. Configure the permission catalogue and templates. Choose table names before migrating.
5. `php artisan migrate`
6. `php artisan access-profiles:sync-templates`

## Comparison (checked on 2026-10-28; versions: access-profiles 0.1.0, spatie/laravel-permission 8.3.2, silber/bouncer v1.0.4, santigarcor/laratrust 8.5.6, Laravel 13.x Gate)
| Row | Access Profiles | spatie/laravel-permission | Bouncer | Laratrust | Gate + policies |
|---|---|---|---|---|---|
| Multi-tenant scope | Tenant + scopes inside it | One team dimension | One tenant id per request | One team, passed per call | You write it |
| One assignment → a set of scopes | Yes | — | — | — | You write it |
| Deny | Yes, deny wins | — | Yes, `forbid()` | — | You write it |
| Validity window | `valid_from` / `valid_until` | — | — | — | You write it |
| Grantor + reason audit | Yes, plus write events | — | — | — | You write it |
| "Who can do X here?" | `Access::holders()` | `User::permission()` for the current team | By role only | `whereHasPermission()` | Loop over users |
| Global tenant state | None; target per check | Global team id | Static scope | None | None |
| Owner / super-admin | No bypass | `Gate::before` | `everything()` | Role check | `Gate::before` |
| Laravel versions | 12.69+, 13.30+ | 12, 13 | 11, 12, 13 | 10, 11, 12, 13 | — |
| Maintenance | New: 0.1.0 (2026-10-28) | Active | Slow (about one release a year) | Active | Laravel core |
Honest reading (show it): spatie/laravel-permission is the safe default for one tenant or one team level, with the biggest community. Bouncer is the closest in spirit (it has deny). Laratrust passes the team explicitly. Plain Gate + policies is enough when roles are few and fixed.
Link "Full comparison with sources" → https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md

## When NOT to use it (show as is)
- One tenant or one flat team level → consider spatie/laravel-permission.
- A few fixed roles → Laravel's Gates and policies may be enough.
- Record-level rules → keep them in a policy.
- An admin UI out of the box → build your own screens.
- A mature, proven package today → this package is new. Review it before relying on it for access control.

## FAQ
1. Does it replace Laravel's Gate? No. Gate and `$user->can()` keep their normal behaviour. Call `canAccess()` or `Access::for()` from a policy.
2. Is there a super-admin or owner bypass? No. An owner gets a full profile like everyone else.
3. Is it safe with Octane and queues? There is no global tenant state. Every check takes a target. Jobs re-check when they run.
4. Do I need a scheduler for expiry? No. The cache stops at the next validity boundary.
5. Does it ship an admin UI? No. Build your own screens.
6. Does it work with Sanctum tokens? Optional. With `token_intersection`, a token can only narrow access. No Sanctum dependency.
7. Can I move from another permission package? Yes. Write a `BackfillSource` and run `access-profiles:backfill --dry-run` first.

## Sections, in order
Header (logo, links: Docs = GitHub README, Comparison, GitHub) → Hero (headline, subline, install command with copy button as primary, "View on GitHub" secondary, one code block as the hero visual) → The problem → Value points → Code walk-through → Comparison → When not to use it → Install steps → FAQ → Final install block → Footer.

## Links (the only links allowed)
- GitHub repo: https://github.com/seisigmasrl/laravel-access-profiles
- Docs (README): https://github.com/seisigmasrl/laravel-access-profiles#readme
- Packagist: https://packagist.org/packages/seisigmasrl/laravel-access-profiles
- Comparison: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md
- Design notes: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/DESIGN.md
- Changelog: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/CHANGELOG.md
- License (MIT): https://github.com/seisigmasrl/laravel-access-profiles/blob/main/LICENSE.md
- Security: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/SECURITY.md
- Privacy page: /privacy
- Fonts: Google Fonts only.

## Brand (approved — keep it)
- Logo mark "Scoped Grid": a rounded square (the tenant) split into 4 cells (scopes); one cell holds a filled accent square (one granted scope). Use this SVG exactly; in dark mode swap stroke to #E2E8F0 and the accent to #4FB3BD:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Access Profiles">
  <g fill="none" stroke="#1E293B" stroke-width="6" stroke-linecap="square">
    <rect x="8" y="8" width="48" height="48" rx="8"/>
    <line x1="32" y1="8" x2="32" y2="56"/>
    <line x1="8" y1="32" x2="56" y2="32"/>
  </g>
  <rect fill="#1F6F78" x="38" y="14" width="12" height="12" rx="2"/>
</svg>
```
- Lockup: the mark + "Access Profiles" in **Manrope 600**, color slate #1E293B (dark: #E2E8F0).
- Brand colors: slate **#1E293B**, teal accent **#1F6F78** (dark-mode accent **#4FB3BD**). Use one more color only for deny / negative states. Never Laravel red as an accent; never the Laravel logo.
- Type: Manrope for text and headings (it matches the logo) + one mono for code (for example JetBrains Mono or IBM Plex Mono). Two families max. No serif.

## Taste
- Feel: **safe, precise, calm.** Light + dark, follow the visitor's system (`prefers-color-scheme`). Both must pass WCAG 2.2 AA.
- Sites the owner likes (taste only, never copy): pestphp.com (clarity: file-labelled code, install line with copy label), inertiajs.com (precision: headline that names the job, code with line numbers), livewire.laravel.com (calm: short H1, one code demo, closing install block).
- Lots of air in the hero and between sections; dense, scannable facts in the comparison table and FAQ. Text width about 70 characters.
- Images: code blocks and simple inline-SVG diagrams only (tenant → scopes → assignment; deny-wins decision). No stock photos, no people, no mascot.
- Avoid: logo walls, star counters, testimonials, animated gradients, glassmorphism, bento grids for their own sake, bold sales slogans.
- The comparison table must be readable on a 390 px phone (for example: cards per row, or a sticky first column with horizontal scroll inside the table only — never page-level horizontal scroll).
- Motion: none or very little now; a separate motion round comes later.
