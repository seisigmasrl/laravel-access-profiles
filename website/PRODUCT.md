# PRODUCT.md — Laravel Access Profiles

Platform: web (static landing page). Register: brand/marketing for a developer library.
Sources: `README.md`, `docs/DESIGN.md`, `docs/COMPARISON.md`, `CHANGELOG.md`, `composer.json`, `tests/`.
Nothing on the site may go beyond these files.

## What it is
A Composer package for multi-tenant Laravel apps. It gives people different permissions in different parts of a tenant.
Profiles combine allow and deny rules. Assignments cover a whole tenant or selected scopes, with validity dates and a
record of who granted access and why. Any matching deny wins. Access is denied by default. (README intro)

Tenants, scopes and holders are your own Eloquent models. A team can be a tenant and its sites can be scopes. (README intro; DESIGN §2)

Version 0.1.0, unreleased. PHP 8.3+, Laravel 12.69+ or 13.30+. MIT. (README; CJ)

## Who it is for
- Laravel developers and tech leads of multi-tenant SaaS apps. (`assumed`, Ricardo's default)
- Their app has a tenant with many scopes inside it, and one person needs different powers in different scopes. (DESIGN §1)
- Not for: one tenant or one flat team level, a few fixed roles, record-level rules, teams that need an admin UI out of the box, or teams that need a mature, proven package today. (README "When NOT to use this package")

## The problem it solves (DESIGN §1, generic)
- Manager in two sites, read-only in a third — same person, same tenant.
- Temporary access (an external auditor until a date) and appointed access (a title such as "Board treasurer").
- A broad grant with one hole: everything in billing, except approving payments.
- "Who can approve payments in site 4?" must be a query, not a loop over every user.
- "Who gave this person access, and why?"

## Value points (strongest first, each with proof)
1. **Access per scope set, not per tenant.** One assignment covers the whole tenant or a chosen list of scopes.
   Proof: README "Profiles and assignments"; `tests/Builders/GrantBuilderTest.php` "gives access the resolver sees at once, only in the listed scopes"; `tests/Resolver/DecisionRulesTest.php` "limits a scope-limited assignment to its listed scopes".
2. **Deny wins. Default is no.** Any matching deny beats every allow, in any order. With no rule, the answer is false.
   Proof: DESIGN §2.1; `tests/Resolver/DecisionRulesTest.php` "is false by default", "lets a deny in one profile win over an allow in another", "lets the deny win whatever order the assignments load in".
3. **Access that ends on time, without a scheduler.** Start dates are inclusive, end dates exclusive. The cache TTL is capped at the next boundary.
   Proof: README "Profiles and assignments"; DESIGN §2.2; `tests/Resolver/DecisionRulesTest.php` "becomes false when valid_until passes without any write"; `tests/Resolver/MemoAndCacheTest.php` "caps the ttl at the next validity boundary".
4. **Who, why, and when — on every grant.** Each assignment stores the grantor and the reason. Revoked rows stay as history. Write events fire after commit with actor, reason and before/after snapshots.
   Proof: README "Profiles and assignments", "Events"; `tests/Events/EventsTest.php` "records one immutable before and after event for each assignment write", "discards grant and profile deletion events and cache bumps on rollback"; `tests/Queries/HistoryTest.php`.
5. **"Who can do X here?" is one query.** `Access::holders()` and `holdersQuery()` apply deny, scope, validity and conditions, and return a builder you can paginate.
   Proof: README "Query access and history"; `tests/Queries/HoldersTest.php` "agrees with can() for every holder, key and target in a fixed matrix", "runs one holder query plus the condition-name lookup, whatever the number of holders".
6. **Safe grants by default.** Guards reject self-assignment and escalation. Scopes must belong to the tenant. The last holder of a protected profile stays. Rejections write nothing.
   Proof: README "Profiles and assignments"; DESIGN §4; `tests/Builders/GuardsTest.php` "rejects when the grantor lacks one allow key in the target scope", "rejects a grant to the grantor even when the grantor holds every key"; `tests/Builders/GrantBuilderTest.php` "writes nothing and keeps the version when it rejects".
7. **No global tenant state, no owner bypass.** Every check takes a target. The memo is a scoped binding, flushed between Octane requests and queued jobs. Owners get a full profile like anyone else.
   Proof: README intro; DESIGN §2.1, §2.3; `tests/Resolver/MemoAndCacheTest.php` "flushes the memo between two octane-style requests".
8. **Small footprint, tested docs.** Runtime dependencies are PHP and `illuminate/*`. Laravel's Gate keeps its normal behaviour. Every README example has a behaviour test.
   Proof: CJ `require`; `tests/ArchTest.php` "it only depends on php and illuminate at runtime"; `tests/Concerns/HasAccessProfilesTest.php` "keeps Laravel Gate independent of access profiles"; README "Testing"; `tests/Docs/ReadmeExamplesTest.php`.

Extra facts, usable in FAQ or details (not hero material): wildcards expand at write time against a code catalogue (`tests/Builders/ProfileBuilderTest.php` "expands a wildcard into exact keys of that module only"); `access-profiles:census` fails CI on unknown stored keys (`tests/Catalogue/CatalogueTest.php` "fails census and names unknown stored keys"); API tokens can only narrow access (`tests/Resolver/TokenIntersectionTest.php` "never widens access through the token"); versioned per-tenant cache works on any driver, no tags (DESIGN §2.2).

## Honest limits (show them on the site)
From README "When NOT to use this package", word for word in meaning:
- One tenant or one flat team level → consider `spatie/laravel-permission`.
- A few fixed roles → Laravel's Gates and policies may be enough.
- Record-level rules → keep them in a policy.
- No admin UI → build your own screens.
- The package is new → review it before you rely on it for access control.

## Voice
- **Safe, precise, calm.** (`confirmed`)
- Plain English. Short sentences. Active voice. One idea per sentence.
- Say what it does, then show the code. Let tests be the proof.
- Name competitors fairly. Say where they are the better choice.
- Use the package's own words: tenant, scope, holder, profile, assignment, allow, deny, grant, revoke.
- Never: "blazing", "revolutionary", "game-changing", "supercharge", "effortless", "magic", "next-gen", "enterprise-grade", "bulletproof", "secure" without a fact next to it, exclamation marks, emoji.
- Never: invented stars, downloads, users or testimonials. The package is unreleased.
- Never on the site: words from any one host app's domain. The package is generic. Examples use team / site / billing (README).

## Design principles (for phase 4)
1. Code is the hero. Real README code, nothing made up.
2. Facts over adjectives. Every claim links to a doc or a test.
3. Quiet surface: few colours, lots of air, strong type. Calm, not dull.
4. The comparison table is a first-class section, readable on a phone.
5. Light and dark from the visitor's system. Both pass WCAG 2.2 AA.
