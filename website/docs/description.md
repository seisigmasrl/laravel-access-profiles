# Description drafts

Two variants each. **Pick** is marked. Lengths counted with Python `len()`.
Sources: README intro, README "Supported versions", README "When NOT to use", DESIGN §2.1, `composer.json`.

## GitHub About (≤ 350 chars)

**A (pick)** — 254 chars
> Scoped access profiles for multi-tenant Laravel apps. Allow and deny rules per tenant or per set of scopes, validity dates, and a grantor and reason on every assignment. Any deny wins; access is denied by default. No global tenant state, no owner bypass.

B — 244 chars
> Give people different permissions in different parts of a tenant. Profiles combine allow and deny rules. Assignments cover a whole tenant or selected scopes, with validity dates and a record of who granted access and why. For Laravel 12 and 13.

Why A: it names the category first ("access profiles", "multi-tenant Laravel"), so GitHub search and readers place it fast. B is the README sentence; good, but it hides "Laravel" until the end.

Website field (GitHub About): `https://laravel-access-profiles.packages.seisigma.co`.

## GitHub topics (8–12)

**Pick (11):** `laravel`, `php`, `authorization`, `permissions`, `access-control`, `multi-tenant`, `multi-tenancy`, `rbac`, `laravel-package`, `audit-trail`, `deny-rules`

Alternative set (10): `laravel`, `php`, `authorization`, `permissions`, `acl`, `multi-tenant`, `saas`, `laravel-package`, `roles`, `scopes`

Why the pick: `rbac` and `access-control` are the terms people search; `audit-trail` and `deny-rules` name what sets it apart. No `saas` (too wide) and no `roles` (the package has profiles, not a role hierarchy — DESIGN §5.4).

## Composer description (≤ 160 chars)

Current `composer.json` — 151 chars:
> Scoped access profiles for multi-tenant Laravel apps: per-scope assignments, deny rules, validity windows and an audit trail, on top of Laravel's Gate.

**A (pick)** — 149 chars
> Scoped access profiles for multi-tenant Laravel apps: per-scope assignments, deny rules, validity windows and an audit trail, next to Laravel's Gate.

B — 145 chars
> Different permissions in different parts of a tenant: allow and deny profiles, scoped assignments, validity dates and an audit trail for Laravel.

Why A: one word changes. "On top of" can read as "it hooks into Gate". In 0.1 it does not register Gate abilities; `$user->can()` stays plain Laravel (README "Checks and views"; DESIGN §3.3 Q3 A; `tests/Concerns/HasAccessProfilesTest.php` "keeps Laravel Gate independent of access profiles"). "Next to" is exact. Note: COMPARISON.md also says "sits on top of the Gate"; that sentence means "you keep using Gate", so it is fair there.

## Tagline (≤ 70 chars)

**A (pick)** — 53 chars
> Different permissions in different parts of a tenant.

B — 58 chars
> Scoped, dated and audited access for multi-tenant Laravel.

Why A: it says the job in the reader's words (README first sentence). Calm. B is a list of adjectives.

## Meta description (150–160 chars)

**A (pick)** — 153 chars
> Scoped access profiles for multi-tenant Laravel apps: allow and deny rules per scope set, validity dates, and who granted access and why. Deny wins. MIT.

B — 152 chars
> Give people different permissions in different parts of a tenant. A Laravel package with deny rules, validity dates, an audit trail and a who-can query.

Why A: "Laravel" and "multi-tenant" sit in the first 60 chars, where search results cut.

## Social preview banner (1280×640)

**A (pick)**
- Headline (53 chars): **Different permissions in different parts of a tenant.**
- Subline (79 chars): Scoped access profiles for Laravel. Deny wins. Every grant has a who and a why.
- Small line: `seisigmasrl/laravel-access-profiles`

B
- Headline (51 chars): **Access per scope. Deny wins. Every grant explained.**
- Subline (78 chars): laravel-access-profiles · composer require seisigmasrl/laravel-access-profiles

Why A: the headline matches the tagline and the site hero, so the banner, GitHub and the site say one thing. B's subline is a command; it is useful, but at thumbnail size it is too small to read.
