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


## Round 2: revise your design
The owner picked YOUR design. Below are 3 designs (yours first, then the other models' round-1 designs) and the revision notes.
Keep your direction and look. Apply every revision note. Take content and ideas from the other designs only where a note says so.

## Revision notes
# Motion round (round 3) — notes for astra-v2

Ricardo approved v2. Keep v2 exactly: same text, layout, colors, type tokens, record icon. Add motion ONLY.
Follow the motion rules in the pack (references/motion.md): reduced motion = no motion; content visible without JS
(opt in with a `.js` class on <html>); animate transform/opacity/filter/stroke-dashoffset only; inline JS <= 3 KB, no
library; one hero moment; <= 3 infinite loops, each >= 1.5 s; micro <= 200 ms, UI <= 300 ms, reveals <= 800 ms, once.
Put these tokens on :root: --ease-out: cubic-bezier(.22,.61,.36,1); --ease-in-out: cubic-bezier(.4,0,.2,1);
--dur-micro: 150ms; --dur-ui: 250ms; --dur-reveal: 600ms; --stagger: 60ms.

Motions per section (each must say something true about the package):
1. Hero scope map (the one hero moment): line drawing (stroke-dashoffset) from holder → assignment → the granted
   scope cells, once, then the granted cells fade in; the denied cell stays plain. Shows "an assignment grants
   scopes inside one tenant".
2. "Same person." comparison: staggered reveal of the rows (opacity + 16px up), once on enter.
3. "From a profile to an answer.": the steps draw in order (connector line drawing + staggered steps); the final
   answer chip gets one slow status pulse (>= 2 s, infinite allowed) — the only loop besides none.
4. Code blocks and install command: copy button feedback "Copy" → "Copied" + check, 1.5 s (dur-ui).
5. Links, buttons, tabs: hover AND :focus-visible micro transitions (color/transform), dur-micro.
6. Other sections: plain blur-up reveal of the heading (opacity, blur 8px→0, 12px up), once.
No marquee, no count-up, no background loops, no typewriter.


## All round-1 designs
### Option "astra-v2" (YOUR design, the one the owner picked; revise THIS one)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="description" content="Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.">
<title>Access Profiles — Different permissions in different parts of a tenant.</title>
<!-- Direction: Scope Map.
The tenant grid makes scope-based access concrete before introducing the API.
File-labelled code connects each concept to the package's actual syntax.
Quiet typography and explicit boundaries keep both themes calm and readable. -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root {
  color-scheme: light dark;
  --bg: #FAFBFC;
  --surface: #FFFFFF;
  --soft: #F0F4F5;
  --ink: #1E293B;
  --muted: #526173;
  --accent: #1F6F78;
  --accent-soft: #E8F3F3;
  --deny: #9F3547;
  --deny-soft: #FBEFF1;
  --line: #CDD6DE;
  --focus: #1F6F78;
  --font: "Manrope", sans-serif;
  --mono: "JetBrains Mono", monospace;
  /* v2 (root): type steps at least 1.25x apart. */
  --text-xs: .8rem;
  --text-sm: 1rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: clamp(1.5625rem, 2.4vw, 1.95rem);
  --text-h2: clamp(2rem, 3.6vw, 3rem);
  --text-h1: clamp(2.5rem, 4.8vw, 4.5rem);
  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;
  --space-10: 8rem;
  --radius-sm: .375rem;
  --radius-md: .75rem;
  --radius-lg: 1.25rem;
  --content: 1200px;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #101820;
    --surface: #16212C;
    --soft: #1D2B38;
    --ink: #E2E8F0;
    --muted: #ABBAC8;
    --accent: #4FB3BD;
    --accent-soft: #17363E;
    --deny: #F0A1AF;
    --deny-soft: #3D2530;
    --line: #3D5061;
    --focus: #4FB3BD;
  }
  .brand-mark g { stroke: #E2E8F0; }
  .brand-mark > rect { fill: #4FB3BD; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: var(--text-base)/1.7 var(--font); }
button, a { -webkit-tap-highlight-color: transparent; }
button { font: inherit; }
a { color: var(--accent); text-underline-offset: .25em; }
a:hover { text-decoration-thickness: 2px; }
:focus-visible { outline: 3px solid var(--focus); outline-offset: 5px; }
::selection { background: var(--accent); color: var(--bg); }
h1, h2, h3, p { margin: 0; }
h1, h2, h3 { line-height: 1.18; text-wrap: balance; }
h1 { font-size: var(--text-h1); font-weight: 700; letter-spacing: -.055em; }
h2 { font-size: var(--text-h2); font-weight: 700; letter-spacing: -.04em; }
h3 { font-size: var(--text-xl); letter-spacing: -.025em; }
p { max-width: 70ch; }
code { font-family: var(--mono); font-size: .88em; overflow-wrap: anywhere; }
.wrap { width: min(var(--content), calc(100% - 64px)); margin-inline: auto; }
.section { padding-block: var(--space-9); border-top: 1px solid var(--line); }
.eyebrow { display: block; margin-bottom: var(--space-5); color: var(--accent); font-size: var(--text-xs); font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.lead { margin-top: var(--space-5); color: var(--muted); font-size: var(--text-lg); }
.section-head { margin-bottom: var(--space-7); max-width: 760px; }
.skip { position: absolute; top: -100px; left: 16px; z-index: 5; padding: 12px 20px; background: var(--surface); }
.skip:focus { top: 12px; }
header { border-bottom: 1px solid var(--line); }
.header-inner { min-height: 96px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.brand { display: flex; align-items: center; gap: 12px; color: var(--ink); font-weight: 600; font-size: 1.125rem; white-space: nowrap; }
.brand-mark { width: 38px; height: 38px; flex: none; }
nav { display: flex; gap: 28px; align-items: center; }
nav a { color: var(--muted); font-size: var(--text-sm); text-decoration: none; padding-block: 12px; }
nav a:hover { color: var(--accent); }
.hero { padding-block: var(--space-10) var(--space-9); }
.hero-grid { display: grid; grid-template-columns: 1.05fr 1fr; gap: 56px; align-items: center; }
.release { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 28px; font-size: var(--text-xs); color: var(--muted); }
.release span { background: var(--accent-soft); color: var(--accent); padding: 3px 9px; border-radius: var(--radius-sm); font-family: var(--mono); }
.hero .lead { max-width: 43ch; }
.hero-install { margin-top: var(--space-6); }
.install-command { display: flex; align-items: center; gap: 12px; border: 1px solid var(--accent); background: var(--accent-soft); padding: 12px 12px 12px 16px; border-radius: var(--radius-md); min-width: 0; }
.install-command code { flex: 1; min-width: 0; font-size: var(--text-xs); }
.copy { flex: none; min-height: 44px; min-width: 60px; padding: 8px 12px; border: 1px solid var(--line); border-radius: var(--radius-sm); background: var(--surface); color: var(--ink); font-size: var(--text-xs); font-weight: 700; cursor: pointer; }
.copy:hover { border-color: var(--accent); color: var(--accent); }
.hero-install .copy, .closing .copy { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.secondary { display: inline-flex; min-height: 44px; align-items: center; gap: 12px; margin-top: 14px; font-size: var(--text-sm); font-weight: 700; }
.requirements { margin-top: 24px; color: var(--muted); font-size: var(--text-xs); }
.code-panel { min-width: 0; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface); overflow: hidden; }
.code-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 18px; border-bottom: 1px solid var(--line); background: var(--soft); font-family: var(--mono); font-size: var(--text-xs); }
.code-bar span:last-child { color: var(--muted); }
pre { margin: 0; padding: 24px 20px; overflow-x: auto; font: .75rem/2 var(--mono); tab-size: 4; }
pre code { font: inherit; overflow-wrap: normal; }
.lines { counter-reset: line; }
.lines .line { display: block; counter-increment: line; }
.lines .line::before { content: counter(line); display: inline-block; width: 2.5em; color: var(--muted); user-select: none; }
.code-note { padding: 14px 20px; border-top: 1px solid var(--line); color: var(--muted); font-size: var(--text-xs); }
.code-note strong { color: var(--accent); font-weight: 600; }
.diagram-caption { display: flex; justify-content: space-between; gap: 20px; margin-top: 18px; color: var(--muted); font-size: var(--text-xs); }
.problem-top { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; margin-bottom: 40px; }
.problem-top .lead { margin-top: 0; }
.map { margin: 0; border: 1px solid var(--line); border-radius: var(--radius-lg); background: var(--surface); padding: 32px; }
.scope-map { display: block; width: 100%; height: auto; font-family: var(--font); }
.scope-map .panel { fill: var(--soft); stroke: var(--line); stroke-width: 1.5; }
.scope-map .tenant { fill: var(--surface); stroke: var(--ink); stroke-width: 1.5; }
.scope-map .allowed { fill: var(--accent-soft); stroke: var(--accent); stroke-width: 1.5; }
.scope-map .denied { fill: var(--deny-soft); stroke: var(--deny); stroke-width: 1.5; }
.scope-map .wire { fill: none; stroke: var(--accent); stroke-width: 2; }
.scope-map text { fill: var(--ink); font-size: 15px; }
.scope-map .small { fill: var(--muted); font-size: 12px; }
.scope-map .label { font-size: 12px; font-weight: 700; letter-spacing: 1px; }
.scope-map .accent { fill: var(--accent); }
.scope-map .negative { fill: var(--deny); }
.scope-map .title { font-size: 20px; font-weight: 700; }
.problem-list { margin-top: 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 0 48px; }
.problem-list p { padding: 20px 0; border-bottom: 1px solid var(--line); font-size: var(--text-sm); }
.problem-list span { display: block; color: var(--muted); margin-top: 6px; }
.values { border-top: 1px solid var(--line); }
.value { display: grid; grid-template-columns: 56px 1fr 300px; gap: 24px; padding: 28px 0; border-bottom: 1px solid var(--line); align-items: start; }
.step-number { color: var(--accent); font: var(--text-sm)/1.8 var(--mono); }
.value h3 { font-size: var(--text-lg); line-height: 1.4; letter-spacing: -.015em; }
.value p { color: var(--muted); font-size: var(--text-sm); margin-top: 8px; }
.value-aside { border-left: 2px solid var(--line); padding-left: 18px; font-size: var(--text-xs); color: var(--muted); }
.value-aside b { display: block; color: var(--accent); font-weight: 600; margin-bottom: 5px; }
.walk { display: grid; gap: 32px; }
.walk-row { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 40px; align-items: start; }
.walk-text { padding-top: 10px; }
.walk-text h3 { font-size: var(--text-lg); }
.walk-text p { margin-top: 12px; color: var(--muted); font-size: var(--text-sm); }
.table-hint { color: var(--muted); font-size: var(--text-xs); margin-bottom: 14px; }
.table-scroll { overflow: auto; max-width: 100%; border: 1px solid var(--line); border-radius: var(--radius-md); }
table { width: 100%; min-width: 1040px; border-collapse: separate; border-spacing: 0; font-size: var(--text-xs); line-height: 1.6; }
caption { text-align: left; padding: 18px; background: var(--soft); color: var(--muted); }
th, td { padding: 17px 16px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--line); }
thead th { background: var(--soft); font-weight: 700; }
tbody th { background: var(--surface); font-weight: 600; width: 185px; }
thead th:first-child, tbody th { position: sticky; left: 0; z-index: 1; border-right: 1px solid var(--line); }
td { background: var(--surface); color: var(--muted); }
td:nth-child(2), thead th:nth-child(2) { background: var(--accent-soft); color: var(--accent); }
tr:last-child td, tr:last-child th { border-bottom: 0; }
.honest { margin-top: 28px; max-width: 78ch; }
.honest h3 { font-size: var(--text-base); margin-bottom: 10px; }
.honest p { color: var(--muted); font-size: var(--text-sm); }
.honest a { display: inline-block; margin-top: 16px; font-size: var(--text-sm); font-weight: 600; padding-block: 8px; }
.split { display: grid; grid-template-columns: 1fr 1.4fr; gap: 72px; }
.not-list { margin: 0; padding: 0; list-style: none; }
.not-list li { padding: 18px 0 18px 24px; border-bottom: 1px solid var(--line); position: relative; font-size: var(--text-sm); }
.not-list li:first-child { padding-top: 0; }
.not-list li::before { content: "−"; color: var(--deny); position: absolute; left: 0; font-weight: 700; }
.install-list { list-style: none; counter-reset: install; margin: 0; padding: 0; display: grid; gap: 16px; }
.install-list li { counter-increment: install; display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; align-items: center; }
.install-list li::before { content: counter(install, decimal-leading-zero); font: var(--text-xs)/1.5 var(--mono); color: var(--muted); }
.install-list .install-command { background: var(--surface); border-color: var(--line); }
.install-instruction { padding: 16px; border-left: 2px solid var(--accent); background: var(--accent-soft); font-size: var(--text-sm); }
details { border-bottom: 1px solid var(--line); }
details:first-child { border-top: 1px solid var(--line); }
summary { position: relative; list-style: none; padding: 23px 40px 23px 0; cursor: pointer; font-size: var(--text-sm); font-weight: 700; }
summary::-webkit-details-marker { display: none; }
summary::after { content: "+"; position: absolute; right: 8px; color: var(--accent); font: 1.25rem var(--mono); }
details[open] summary::after { content: "−"; }
details p { padding-bottom: 24px; color: var(--muted); font-size: var(--text-sm); }
.closing { background: var(--accent-soft); padding-block: var(--space-9); border-top: 1px solid var(--line); }
.closing-inner { max-width: 740px; margin-inline: auto; text-align: center; }
.closing .install-command { margin-top: 28px; background: var(--surface); text-align: left; }
.closing p { color: var(--muted); margin-top: 16px; }
footer { padding-block: 40px; border-top: 1px solid var(--line); }
.footer-top { display: flex; justify-content: space-between; gap: 32px; align-items: start; }
.footer-links { display: flex; flex-wrap: wrap; gap: 8px 24px; max-width: 570px; }
.footer-links a { font-size: var(--text-xs); color: var(--muted); padding-block: 10px; }
.footer-meta { color: var(--muted); font-size: var(--text-xs); margin-top: 22px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
@media (max-width: 1050px) {
  .hero-grid { grid-template-columns: 1fr; gap: 40px; }
  .hero-copy { max-width: 750px; }
  .hero-install { max-width: 610px; }
  .value { grid-template-columns: 40px 1fr 230px; }
  .split { gap: 40px; grid-template-columns: 1fr 1.5fr; }
}
@media (max-width: 700px) {
  .wrap { width: calc(100% - 40px); }
  .header-inner { padding-block: 18px; flex-wrap: wrap; gap: 10px; }
  nav { width: 100%; gap: 28px; }
  .hero { padding-block: 56px; }
  .section, .closing { padding-block: 56px; }
  .hero-grid { gap: 32px; }
  .hero h1 { max-width: 13ch; }
  .install-command { gap: 8px; padding: 10px; }
  .copy { padding-inline: 10px; }
  .problem-top, .split, .walk-row { grid-template-columns: 1fr; gap: 24px; }
  .problem-list { grid-template-columns: 1fr; margin-top: 20px; }
  .map { padding: 16px 10px; }
  .scope-map { aspect-ratio: 540 / 690; }
  .diagram-caption { flex-direction: column; gap: 6px; padding-inline: 6px; }
  .value { grid-template-columns: 30px minmax(0, 1fr); gap: 12px; }
  .value-aside { grid-column: 2; }
  .walk { gap: 36px; }
  .walk-row { gap: 14px; }
  pre { padding: 18px 12px; }
  .footer-top { flex-direction: column; }
  .footer-links { gap: 6px 20px; }
  tbody th, thead th:first-child { width: 132px; min-width: 132px; max-width: 132px; }
}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header>
  <div class="wrap header-inner">
    <div class="brand">
      <svg class="brand-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Access Profiles">
        <g fill="none" stroke="#1E293B" stroke-width="6" stroke-linecap="square">
          <rect x="8" y="8" width="48" height="48" rx="8"/>
          <line x1="32" y1="8" x2="32" y2="56"/>
          <line x1="8" y1="32" x2="56" y2="32"/>
        </g>
        <rect fill="#1F6F78" x="38" y="14" width="12" height="12" rx="2"/>
      </svg>
      <span>Access Profiles</span>
    </div>
    <nav aria-label="Main navigation">
      <a href="https://github.com/seisigmasrl/laravel-access-profiles#readme">Docs</a>
      <a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md">Comparison</a>
      <a href="https://github.com/seisigmasrl/laravel-access-profiles">GitHub <span aria-hidden="true">↗</span></a>
    </nav>
  </div>
</header>

<main id="main">
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <div class="release"><span>v0.1.0</span> Open source · MIT</div>
        <h1>Different permissions in different parts of a tenant.</h1>
        <p class="lead">Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.</p>
        <div class="hero-install">
          <div class="install-command">
            <code>composer require seisigmasrl/laravel-access-profiles</code>
            <button class="copy" type="button" aria-label="Copy Composer install command">Copy</button>
          </div>
          <a class="secondary" href="https://github.com/seisigmasrl/laravel-access-profiles">View on GitHub <span aria-hidden="true">↗</span></a>
        </div>
        <p class="requirements">PHP 8.3+ · Laravel 12.69+ or 13.30+</p>
      </div>
      <div class="code-panel">
        <div class="code-bar"><span>grant.php</span><span>Assignment</span></div>
        <pre class="lines" tabindex="0" aria-label="Grant code example"><code><span class="line">$assignment = Access::grant('reviewer')-&gt;to($user)-&gt;in($team)</span><span class="line">    -&gt;onlyScopes([$site, $otherSite])-&gt;titled('Review cover')</span><span class="line">    -&gt;validFrom(now())-&gt;validUntil(now()-&gt;addMonths(6))</span><span class="line">    -&gt;by($admin)-&gt;because('Cover leave')-&gt;save();</span></code></pre>
        <div class="code-note"><strong>One assignment.</strong> Selected scopes. A validity window. A reason.</div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="problem-top">
        <div><span class="eyebrow">The problem</span><h2>Same person.<br>Same tenant.<br>Different access.</h2></div>
        <p class="lead">Manager in two sites, read-only in a third. A broad grant in billing, except approving payments. Access needs to describe where a person can act, and where it stops.</p>
      </div>
      <figure class="map">
        <svg class="scope-map" viewBox="0 0 1100 410" role="img" aria-labelledby="map-title map-description">
          <title id="map-title">A holder, an assignment, and scopes within a tenant</title>
          <desc id="map-description">One person has manager access in site 1 and site 2, and read-only access in site 3. Payment approval is denied in site 4. Assignments record validity dates, grantor and reason. A matching deny always wins.</desc>
          <style>
            @media (max-width: 700px) {
              /* Root fix (phone): holder and assignment side by side, tenant below; no overlap. */
              .map-holder { transform: translate(-6px, 0); }
              .map-assignment { transform: translate(-36px, 0); }
              .map-tenant { transform: translate(-570px, 290px); }
              .map-connectors { display: none; }
            }
          </style>
          <g class="map-connectors">
            <path class="wire" d="M210 194H260M510 194H580"/>
            <circle cx="580" cy="194" r="4" fill="var(--accent)"/>
          </g>
          <g class="map-holder">
            <text x="16" y="38" class="label">01 / HOLDER</text>
            <rect class="panel" x="16" y="110" width="194" height="168" rx="12"/>
            <!-- v2 (root): a model record, not a person (pack: no people). -->
            <rect x="34" y="136" width="44" height="44" rx="6" fill="none" stroke="var(--ink)" stroke-width="1.5"/>
            <path d="M42 150H70M42 158H64M42 166H58" stroke="var(--ink)" stroke-width="1.5"/>
            <text x="34" y="220" class="title">Same person</text>
            <text x="34" y="247" class="small">Your Eloquent model</text>
          </g>
          <g class="map-assignment">
            <text x="260" y="38" class="label">02 / ASSIGNMENT</text>
            <rect class="allowed" x="260" y="90" width="250" height="208" rx="12"/>
            <text x="280" y="124" class="title">Profile + scope set</text>
            <text x="280" y="155" class="small">Whole tenant or selected scopes</text>
            <path d="M280 173H490" stroke="var(--accent)" stroke-opacity=".4"/>
            <text x="280" y="202">Valid from → valid until</text>
            <text x="280" y="232" class="small">Who granted access</text>
            <text x="280" y="260" class="small">Why access was granted</text>
          </g>
          <g class="map-tenant">
            <text x="580" y="38" class="label">03 / TENANT → SCOPES</text>
            <rect class="tenant" x="580" y="62" width="504" height="316" rx="16"/>
            <text x="602" y="98" class="title">Team</text>
            <text x="1062" y="96" text-anchor="end" class="small">Your Eloquent model</text>
            <rect class="allowed" x="602" y="120" width="220" height="106" rx="8"/>
            <text x="620" y="150" class="small">Site 1</text>
            <text x="620" y="183" class="title accent">Manager</text>
            <rect class="allowed" x="840" y="120" width="220" height="106" rx="8"/>
            <text x="858" y="150" class="small">Site 2</text>
            <text x="858" y="183" class="title accent">Manager</text>
            <rect class="panel" x="602" y="242" width="220" height="112" rx="8"/>
            <text x="620" y="272" class="small">Site 3</text>
            <text x="620" y="306" class="title">Read-only</text>
            <rect class="denied" x="840" y="242" width="220" height="112" rx="8"/>
            <text x="858" y="272" class="small">Site 4 · billing</text>
            <text x="858" y="303" class="negative" font-weight="700">Payment approval</text>
            <text x="858" y="330" class="negative">Deny wins</text>
          </g>
        </svg>
        <figcaption class="diagram-caption"><span>The scope map · different assignments can cover different scopes.</span><span>No matching rule → access denied.</span></figcaption>
      </figure>
      <div class="problem-list">
        <p>Access can be temporary or appointed.<span>An external auditor until a date. A title such as “Board treasurer”.</span></p>
        <p>A broad grant can have one hole.<span>Everything in billing, except approving payments.</span></p>
        <p>“Who can approve payments in site 4?”<span>That must be a query, not a loop over every user.</span></p>
        <p>“Who gave this person access, and why?”<span>The answer belongs with the assignment.</span></p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Follow the scope map</span><h2>Explicit boundaries.<br>Predictable decisions.</h2><p class="lead">Tenants, scopes and holders are your own Eloquent models. Profiles combine allow and deny rules. Assignments connect them.</p></div>
      <div class="values">
        <article class="value"><span class="step-number">01</span><div><h3>Access per scope set, not per tenant.</h3><p>One assignment covers the whole tenant or a chosen list of scopes.</p></div><div class="value-aside"><b>Assignment → scope cells</b><code>grant.php</code> selects the scopes.</div></article>
        <article class="value"><span class="step-number">02</span><div><h3>Deny wins. Default is no.</h3><p>Any matching deny beats every allow, in any order. With no rule, the answer is false.</p></div><div class="value-aside"><b>The denied cell</b><code>profile.php</code> combines allow and deny.</div></article>
        <article class="value"><span class="step-number">03</span><div><h3>Access that ends on time, without a scheduler.</h3><p>Start dates are inclusive, end dates exclusive. The cache TTL stops at the next boundary.</p></div><div class="value-aside"><b>The assignment’s dates</b><code>grant.php</code> sets the validity window.</div></article>
        <article class="value"><span class="step-number">04</span><div><h3>Who, why, and when — on every grant.</h3><p>Each assignment stores the grantor and the reason. Revoked rows stay as history. Write events fire after commit.</p></div><div class="value-aside"><b>The assignment’s record</b><code>grant.php</code> records who and why.<br><code>query.php</code> retrieves history.</div></article>
        <article class="value"><span class="step-number">05</span><div><h3>“Who can do X here?” is one query.</h3><p><code>Access::holders()</code> applies deny, scope, validity and conditions, and returns a builder you can paginate.</p></div><div class="value-aside"><b>From a scope back to holders</b><code>query.php</code> asks who has access.</div></article>
        <article class="value"><span class="step-number">06</span><div><h3>Safe grants by default.</h3><p>Guards reject self-assignment and escalation. Scopes must belong to the tenant. Rejections write nothing.</p></div><div class="value-aside"><b>The tenant boundary</b><code>grant.php</code> names the tenant, scopes and grantor.</div></article>
        <article class="value"><span class="step-number">07</span><div><h3>No global tenant state, no owner bypass.</h3><p>Every check takes a target. Safe with Octane and queued jobs. Owners get a full profile like anyone else.</p></div><div class="value-aside"><b>A specific scope, every time</b><code>check.php</code> passes the target.</div></article>
        <article class="value"><span class="step-number">08</span><div><h3>Small footprint, tested docs.</h3><p>PHP and 8 <code>illuminate/*</code> packages only. Every README example has a behaviour test.</p></div><div class="value-aside"><b>Your models, Laravel’s foundation</b>Each value point has a test in the repo.</div></article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Code walk-through</span><h2>From a profile to an answer.</h2><p class="lead">Access Profiles works next to Laravel’s Gate. <code>$user-&gt;can()</code> and Gate keep their normal behaviour; your policies call <code>canAccess()</code>.</p></div>
      <div class="walk">
        <div class="walk-row">
          <div class="walk-text"><span class="eyebrow">01 / Define</span><h3>Allow a group. Deny an action.</h3><p>A profile combines rules. A matching deny wins.</p></div>
          <div class="code-panel"><div class="code-bar"><span>profile.php</span><span>Profile</span></div><pre tabindex="0"><code>$profile = Access::profile('reviewer')-&gt;in($team)
    -&gt;allow('billing.*')-&gt;deny('billing.invoice.approve')
    -&gt;by($admin)-&gt;because('Keep approvals separate')-&gt;save();</code></pre></div>
        </div>
        <div class="walk-row">
          <div class="walk-text"><span class="eyebrow">02 / Grant</span><h3>Choose where and when.</h3><p>Assign the profile to a holder, with selected scopes, dates and a reason.</p></div>
          <div class="code-panel"><div class="code-bar"><span>grant.php</span><span>Assignment</span></div><pre tabindex="0"><code>$assignment = Access::grant('reviewer')-&gt;to($user)-&gt;in($team)
    -&gt;onlyScopes([$site, $otherSite])-&gt;titled('Review cover')
    -&gt;validFrom(now())-&gt;validUntil(now()-&gt;addMonths(6))
    -&gt;by($admin)-&gt;because('Cover leave')-&gt;save();</code></pre></div>
        </div>
        <div class="walk-row">
          <div class="walk-text"><span class="eyebrow">03 / Check</span><h3>Ask about a target.</h3><p>Check access, or explain the decision.</p></div>
          <div class="code-panel"><div class="code-bar"><span>check.php</span><span>Decision</span></div><pre tabindex="0"><code>$allowed = Access::for($user)-&gt;can('billing.invoice.view', $site);
$sameAnswer = $user-&gt;canAccess('billing.invoice.view', $site);
$decision = Access::for($user)-&gt;explain('billing.invoice.approve', $site);</code></pre></div>
        </div>
        <div class="walk-row">
          <div class="walk-text"><span class="eyebrow">04 / Query</span><h3>Find holders. Read history.</h3><p>Query access with scope, validity, conditions and deny rules applied.</p></div>
          <div class="code-panel"><div class="code-bar"><span>query.php</span><span>Holders + history</span></div><pre tabindex="0"><code>$holders = Access::holders('billing.invoice.view', $site);
$count = Access::holdersQuery('billing.invoice.view', $site)-&gt;count();
$history = Access::history($user, $team);</code></pre></div>
        </div>
        <div class="walk-row">
          <div class="walk-text"><span class="eyebrow">05 / Render</span><h3>Use the same check in Blade.</h3><p>Pass the permission and its target.</p></div>
          <div class="code-panel"><div class="code-bar"><span>Blade</span><span>View</span></div><pre tabindex="0"><code>@canAccess('billing.invoice.view', $site)
View invoices
@endcanAccess</code></pre></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section-head"><span class="eyebrow">Comparison</span><h2>Choose for the access model you have.</h2><p class="lead">Access Profiles is new. Scope sets, deny rules and grant history are reasons to consider it. Other models may need less.</p></div>
      <p class="table-hint" id="table-hint">Checked on 2026-10-28. Scroll inside the table to compare packages; row labels stay visible.</p>
      <div class="table-scroll" tabindex="0" role="region" aria-label="Package comparison" aria-describedby="table-hint">
        <table>
          <caption>Versions: Access Profiles 0.1.0 · spatie/laravel-permission 8.3.2 · silber/bouncer v1.0.4 · santigarcor/laratrust 8.5.6 · Laravel 13.x Gate</caption>
          <thead><tr><th scope="col">Capability</th><th scope="col">Access Profiles</th><th scope="col">spatie/laravel-permission</th><th scope="col">Bouncer</th><th scope="col">Laratrust</th><th scope="col">Gate + policies</th></tr></thead>
          <tbody>
            <tr><th scope="row">Multi-tenant scope</th><td>Tenant + scopes inside it</td><td>One team dimension</td><td>One tenant id per request</td><td>One team, passed per call</td><td>You write it</td></tr>
            <tr><th scope="row">One assignment → a set of scopes</th><td>Yes</td><td>—</td><td>—</td><td>—</td><td>You write it</td></tr>
            <tr><th scope="row">Deny</th><td>Yes, deny wins</td><td>—</td><td>Yes, <code>forbid()</code></td><td>—</td><td>You write it</td></tr>
            <tr><th scope="row">Validity window</th><td><code>valid_from</code> / <code>valid_until</code></td><td>—</td><td>—</td><td>—</td><td>You write it</td></tr>
            <tr><th scope="row">Grantor + reason audit</th><td>Yes, plus write events</td><td>—</td><td>—</td><td>—</td><td>You write it</td></tr>
            <tr><th scope="row">“Who can do X here?”</th><td><code>Access::holders()</code></td><td><code>User::permission()</code> for the current team</td><td>By role only</td><td><code>whereHasPermission()</code></td><td>Loop over users</td></tr>
            <tr><th scope="row">Global tenant state</th><td>None; target per check</td><td>Global team id</td><td>Static scope</td><td>None</td><td>None</td></tr>
            <tr><th scope="row">Owner / super-admin</th><td>No bypass</td><td><code>Gate::before</code></td><td><code>everything()</code></td><td>Role check</td><td><code>Gate::before</code></td></tr>
            <tr><th scope="row">Laravel versions</th><td>12.69+, 13.30+</td><td>12, 13</td><td>11, 12, 13</td><td>10, 11, 12, 13</td><td>—</td></tr>
            <tr><th scope="row">Maintenance</th><td>New: 0.1.0 (2026-10-28)</td><td>Active</td><td>Slow (about one release a year)</td><td>Active</td><td>Laravel core</td></tr>
          </tbody>
        </table>
      </div>
      <div class="honest"><h3>An honest reading</h3><p>spatie/laravel-permission is the safe default for one tenant or one team level, with the biggest community. Bouncer is the closest in spirit (it has deny). Laratrust passes the team explicitly. Plain Gate + policies is enough when roles are few and fixed.</p><a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md">Full comparison with sources <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div><span class="eyebrow">Fit matters</span><h2>When not to use it</h2></div>
      <ul class="not-list">
        <li>One tenant or one flat team level → consider spatie/laravel-permission.</li>
        <li>A few fixed roles → Laravel's Gates and policies may be enough.</li>
        <li>Record-level rules → keep them in a policy.</li>
        <li>An admin UI out of the box → build your own screens.</li>
        <li>A mature, proven package today → this package is new. Review it before relying on it for access control.</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div><span class="eyebrow">Install</span><h2>Start with your permission catalogue.</h2><p class="lead">Choose table names before migrating.</p><p class="requirements">PHP 8.3+<br>Laravel 12.69+ or 13.30+<br>Namespace: <code>Seisigma\AccessProfiles</code></p></div>
      <ol class="install-list">
        <li><div class="install-command"><code>composer require seisigmasrl/laravel-access-profiles</code><button class="copy" type="button" aria-label="Copy Composer install command">Copy</button></div></li>
        <li><div class="install-command"><code>php artisan vendor:publish --tag=access-profiles-config</code><button class="copy" type="button" aria-label="Copy publish configuration command">Copy</button></div></li>
        <li><div class="install-command"><code>php artisan vendor:publish --tag=access-profiles-migrations</code><button class="copy" type="button" aria-label="Copy publish migrations command">Copy</button></div></li>
        <li><p class="install-instruction">Configure the permission catalogue and templates. Choose table names before migrating.</p></li>
        <li><div class="install-command"><code>php artisan migrate</code><button class="copy" type="button" aria-label="Copy migration command">Copy</button></div></li>
        <li><div class="install-command"><code>php artisan access-profiles:sync-templates</code><button class="copy" type="button" aria-label="Copy sync templates command">Copy</button></div></li>
      </ol>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div><span class="eyebrow">FAQ</span><h2>A few boundaries,<br>made explicit.</h2></div>
      <div>
        <details open><summary>Does it replace Laravel's Gate?</summary><p>No. Gate and <code>$user-&gt;can()</code> keep their normal behaviour. Call <code>canAccess()</code> or <code>Access::for()</code> from a policy.</p></details>
        <details><summary>Is there a super-admin or owner bypass?</summary><p>No. An owner gets a full profile like everyone else.</p></details>
        <details><summary>Is it safe with Octane and queues?</summary><p>There is no global tenant state. Every check takes a target. Jobs re-check when they run.</p></details>
        <details><summary>Do I need a scheduler for expiry?</summary><p>No. The cache stops at the next validity boundary.</p></details>
        <details><summary>Does it ship an admin UI?</summary><p>No. Build your own screens.</p></details>
        <details><summary>Does it work with Sanctum tokens?</summary><p>Optional. With <code>token_intersection</code>, a token can only narrow access. No Sanctum dependency.</p></details>
        <details><summary>Can I move from another permission package?</summary><p>Yes. Write a <code>BackfillSource</code> and run <code>access-profiles:backfill --dry-run</code> first.</p></details>
      </div>
    </div>
  </section>

  <section class="closing">
    <div class="wrap">
      <div class="closing-inner">
        <span class="eyebrow">Access Profiles</span>
        <h2>A tenant. Its scopes.<br>Access with boundaries.</h2>
        <p>Allow and deny. Grant and revoke. Keep the reason.</p>
        <div class="install-command"><code>composer require seisigmasrl/laravel-access-profiles</code><button class="copy" type="button" aria-label="Copy Composer install command">Copy</button></div>
        <a class="secondary" href="https://github.com/seisigmasrl/laravel-access-profiles#readme">Read the docs <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="footer-top">
      <div class="brand">
        <svg class="brand-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Access Profiles">
          <g fill="none" stroke="#1E293B" stroke-width="6" stroke-linecap="square">
            <rect x="8" y="8" width="48" height="48" rx="8"/>
            <line x1="32" y1="8" x2="32" y2="56"/>
            <line x1="8" y1="32" x2="56" y2="32"/>
          </g>
          <rect fill="#1F6F78" x="38" y="14" width="12" height="12" rx="2"/>
        </svg>
        <span>Access Profiles</span>
      </div>
      <div class="footer-links" aria-label="Project resources">
        <a href="https://github.com/seisigmasrl/laravel-access-profiles">GitHub</a>
        <a href="https://packagist.org/packages/seisigmasrl/laravel-access-profiles">Packagist</a>
        <a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/DESIGN.md">Design notes</a>
        <a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/CHANGELOG.md">Changelog</a>
        <a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/LICENSE.md">MIT license</a>
        <a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/SECURITY.md">Security</a>
        <a href="/privacy">Privacy</a>
      </div>
    </div>
    <p class="footer-meta">Ricardo A. Vargas R. (Seisigma SRL) · Version 0.1.0 · Released 2026-10-28 on Packagist</p>
  </div>
</footer>
<div class="sr-only" role="status" aria-live="polite" id="copy-status"></div>
<script>
(function () {
  const map = document.querySelector('.scope-map');
  const narrow = window.matchMedia('(max-width: 700px)');
  function sizeMap() {
    map.setAttribute('viewBox', narrow.matches ? '0 0 540 690' : '0 0 1100 410');
  }
  sizeMap();
  narrow.addEventListener('change', sizeMap);

  const status = document.getElementById('copy-status');
  document.querySelectorAll('.copy').forEach(function (button) {
    button.addEventListener('click', async function () {
      const code = button.parentElement.querySelector('code');
      const command = code.textContent;
      let copied = false;
      try {
        await navigator.clipboard.writeText(command);
        copied = true;
      } catch (error) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        try { copied = document.execCommand('copy'); } catch (ignored) {}
        if (copied) selection.removeAllRanges();
      }
      button.textContent = copied ? 'Copied' : 'Select';
      status.textContent = copied ? 'Command copied to clipboard.' : 'Command selected. Use your device’s copy command.';
      window.setTimeout(function () { button.textContent = 'Copy'; }, 2200);
    });
  });
}());
</script>
</body>
</html>

```

### Option "argon"

```html
<!doctype html>
<!--
Direction: Grid System
1. Expands the 2x2 Scoped Grid logo mark into a full-page architectural grid of hairline borders, coordinate headers, and structured cells.
2. Uses monochrome slate surfaces with the teal accent (#1F6F78 / #4FB3BD) reserved strictly for granted scopes and the crimson token reserved strictly for deny rules.
3. Pairs large, calm Manrope headings with monospace technical specification labels so the page reads like a calibrated instrument rather than a marketing brochure.
-->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Access Profiles — Different permissions in different parts of a tenant.</title>
  <meta name="description" content="Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      /* Brand & Surface Colors (Light Mode Default) */
      --color-slate: #1E293B;
      --color-ink: #0F172A;
      --color-ink-secondary: #334155;
      --color-ink-muted: #475569;
      --color-bg-canvas: #F8FAFC;
      --color-bg-surface: #FFFFFF;
      --color-bg-subtle: #F1F5F9;
      --color-bg-code: #0F172A;
      --color-border-strong: #94A3B8;
      --color-border-grid: #CBD5E1;
      --color-border-subtle: #E2E8F0;

      /* Semantic Grant (Teal Accent) */
      --color-grant: #1F6F78;
      --color-grant-hover: #185860;
      --color-grant-surface: #EBF5F6;
      --color-grant-border: #99CDD2;
      --color-grant-contrast: #FFFFFF;

      /* Semantic Deny (Negative State Only) */
      --color-deny: #991B1B;
      --color-deny-surface: #FEF2F2;
      --color-deny-border: #FECACA;

      /* Code Block Syntax (WCAG AA on dark code panel) */
      --code-bg: #0F172A;
      --code-surface-bar: #1E293B;
      --code-border: #334155;
      --code-text: #E2E8F0;
      --code-muted: #94A3B8;
      --code-var: #CBD5E1;
      --code-method: #7DD3FC;
      --code-grant: #5EEAD4;
      --code-deny: #FCA5A5;

      /* Typography Scale */
      --font-sans: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

      --text-xs: 0.75rem;
      --text-sm: 0.875rem;
      --text-base: 1rem;
      --text-lg: 1.125rem;
      --text-xl: 1.25rem;
      --text-2xl: 1.5rem;
      --text-3xl: clamp(1.75rem, 2.8vw, 2.25rem);
      --text-hero: clamp(2.125rem, 4.2vw, 3.5rem);

      /* Spacing Scale */
      --space-1: 0.25rem;
      --space-2: 0.5rem;
      --space-3: 0.75rem;
      --space-4: 1rem;
      --space-5: 1.25rem;
      --space-6: 1.5rem;
      --space-8: 2rem;
      --space-10: 2.5rem;
      --space-12: 3rem;
      --space-16: 4rem;
      --space-20: 5rem;
      --space-24: 6rem;

      /* Radius & Layout Tokens */
      --radius-xs: 2px;
      --radius-sm: 4px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --container-max: 1280px;
      --measure-prose: 68ch;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --color-slate: #E2E8F0;
        --color-ink: #F1F5F9;
        --color-ink-secondary: #CBD5E1;
        --color-ink-muted: #94A3B8;
        --color-bg-canvas: #090D16;
        --color-bg-surface: #0F172A;
        --color-bg-subtle: #162033;
        --color-bg-code: #090D16;
        --color-border-strong: #475569;
        --color-border-grid: #1E293B;
        --color-border-subtle: #162033;

        --color-grant: #4FB3BD;
        --color-grant-hover: #67C3CC;
        --color-grant-surface: #0F292E;
        --color-grant-border: #1F6F78;
        --color-grant-contrast: #090D16;

        --color-deny: #F87171;
        --color-deny-surface: #281115;
        --color-deny-border: #7F1D1D;

        --code-bg: #070A12;
        --code-surface-bar: #0F172A;
        --code-border: #1E293B;
      }
    }

    /* Reset & Base */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      font-family: var(--font-sans);
      font-size: 16px;
      line-height: 1.6;
      color: var(--color-ink);
      background-color: var(--color-bg-canvas);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    body {
      min-height: 100vh;
      overflow-x: hidden;
      background-image:
        linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px),
        linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px);
      background-size: 64px 64px;
      background-position: top center;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    a:focus-visible,
    button:focus-visible {
      outline: 2px solid var(--color-grant);
      outline-offset: 2px;
    }

    code, pre {
      font-family: var(--font-mono);
      font-feature-settings: "liga" 0;
    }

    p code, li code, td code {
      font-size: 0.875em;
      padding: 0.125rem 0.375rem;
      border-radius: var(--radius-xs);
      background-color: var(--color-bg-subtle);
      border: 1px solid var(--color-border-grid);
      color: var(--color-ink);
      white-space: nowrap;
    }

    /* Master Architectural Grid Frame */
    .page-frame {
      max-width: var(--container-max);
      margin: 0 auto;
      background-color: var(--color-bg-surface);
      border-left: 1px solid var(--color-border-grid);
      border-right: 1px solid var(--color-border-grid);
      box-shadow: 0 0 0 1px var(--color-border-subtle);
    }

    /* Spec Labels & Coordinate Markers */
    .spec-tag {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-ink-muted);
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .spec-dot {
      width: 7px;
      height: 7px;
      border-radius: 1px;
      display: inline-block;
      background-color: var(--color-border-strong);
    }

    .spec-dot.grant {
      background-color: var(--color-grant);
    }

    .spec-dot.deny {
      background-color: var(--color-deny);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-xs);
      border: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-subtle);
      color: var(--color-ink-secondary);
    }

    .badge-grant {
      background-color: var(--color-grant-surface);
      border-color: var(--color-grant-border);
      color: var(--color-grant);
    }

    .badge-deny {
      background-color: var(--color-deny-surface);
      border-color: var(--color-deny-border);
      color: var(--color-deny);
    }

    /* Header */
    .site-header {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: stretch;
      border-bottom: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-surface);
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .brand-cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-6);
    }

    .brand-lockup {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3);
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    }

    @media (prefers-color-scheme: dark) {
      .brand-logo g {
        stroke: #E2E8F0;
      }
      .brand-logo > rect {
        fill: #4FB3BD;
      }
    }

    .brand-name {
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 1.125rem;
      letter-spacing: -0.02em;
      color: var(--color-slate);
    }

    .header-meta {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-ink-muted);
      padding-left: var(--space-3);
      border-left: 1px solid var(--color-border-grid);
    }

    .site-nav {
      display: flex;
      align-items: stretch;
    }

    .site-nav a {
      display: inline-flex;
      align-items: center;
      padding: 0 var(--space-6);
      border-left: 1px solid var(--color-border-grid);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 500;
      color: var(--color-ink-secondary);
      transition: background-color 120ms ease, color 120ms ease;
    }

    .site-nav a:hover {
      background-color: var(--color-bg-subtle);
      color: var(--color-ink);
    }

    /* Section Header Bar */
    .section-bar {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      padding: var(--space-3) var(--space-6);
      background-color: var(--color-bg-subtle);
      border-bottom: 1px solid var(--color-border-grid);
    }

    .section-intro {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid var(--color-border-grid);
    }

    .section-intro-title {
      padding: var(--space-8) var(--space-6);
      border-right: 1px solid var(--color-border-grid);
    }

    .section-intro-title h2 {
      font-size: var(--text-3xl);
      font-weight: 700;
      letter-spacing: -0.025em;
      line-height: 1.18;
      color: var(--color-slate);
    }

    .section-intro-desc {
      padding: var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: var(--color-ink-secondary);
      font-size: var(--text-base);
      max-width: var(--measure-prose);
    }

    /* 1. Hero Section */
    .hero-spec-strip {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      border-bottom: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-subtle);
    }

    .hero-spec-item {
      padding: var(--space-2) var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-ink-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .hero-spec-item:last-child {
      border-right: none;
    }

    .hero-spec-item strong {
      color: var(--color-ink);
      font-weight: 600;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      border-bottom: 1px solid var(--color-border-grid);
    }

    .hero-copy-cell {
      padding: var(--space-16) var(--space-8);
      border-right: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-8);
    }

    .hero-headline {
      font-size: var(--text-hero);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.08;
      color: var(--color-slate);
      margin-top: var(--space-4);
    }

    .hero-subline {
      font-size: var(--text-lg);
      color: var(--color-ink-secondary);
      max-width: 54ch;
      margin-top: var(--space-5);
      line-height: 1.55;
    }

    .hero-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 580px;
    }

    .install-command-box {
      display: flex;
      align-items: stretch;
      border: 2px solid var(--color-grant);
      border-radius: var(--radius-sm);
      background-color: var(--color-bg-surface);
      overflow: hidden;
    }

    .install-prompt {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--color-ink);
      overflow-x: auto;
      flex: 1;
      white-space: nowrap;
      gap: var(--space-2);
    }

    .install-prompt-prefix {
      color: var(--color-grant);
      user-select: none;
      font-weight: 600;
    }

    .copy-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: 0 var(--space-5);
      background-color: var(--color-grant);
      color: var(--color-grant-contrast);
      border: none;
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      cursor: pointer;
      flex-shrink: 0;
      transition: background-color 120ms ease;
    }

    .copy-btn-primary:hover {
      background-color: var(--color-grant-hover);
    }

    .hero-secondary-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-4);
      padding-top: var(--space-1);
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.55rem var(--space-4);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      background-color: var(--color-bg-surface);
      color: var(--color-ink);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 600;
      transition: background-color 120ms ease, border-color 120ms ease;
    }

    .btn-secondary:hover {
      background-color: var(--color-bg-subtle);
      border-color: var(--color-ink);
    }

    .hero-footnote {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-ink-muted);
    }

    /* Hero Visual Cell (2x2 Scope Grid Diagram + Code Block) */
    .hero-visual-cell {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: var(--color-bg-subtle);
    }

    .scope-matrix-panel {
      padding: var(--space-6);
      border-bottom: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-surface);
    }

    .scope-matrix-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
      gap: var(--space-2);
      flex-wrap: wrap;
    }

    .scope-2x2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 2px solid var(--color-slate);
      border-radius: var(--radius-md);
      overflow: hidden;
      background-color: var(--color-bg-surface);
    }

    .scope-cell {
      padding: var(--space-4);
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-2);
      min-height: 88px;
    }

    .scope-cell:nth-child(2n) {
      border-right: none;
    }

    .scope-cell:nth-child(n+3) {
      border-bottom: none;
    }

    .scope-cell.is-granted {
      background-color: var(--color-grant-surface);
      box-shadow: inset 0 0 0 1px var(--color-grant-border);
    }

    .scope-cell-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 600;
    }

    .scope-cell-meta {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-ink-muted);
    }

    .scope-cell.is-granted .scope-cell-meta {
      color: var(--color-grant);
      font-weight: 500;
    }

    /* Code Windows */
    .code-panel {
      background-color: var(--code-bg);
      color: var(--code-text);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .code-panel-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-4);
      background-color: var(--code-surface-bar);
      border-bottom: 1px solid var(--code-border);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
    }

    .code-file-label {
      color: #F8FAFC;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .code-file-label::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 1px;
      background-color: #4FB3BD;
      display: inline-block;
    }

    .code-copy-btn {
      background: transparent;
      border: 1px solid #475569;
      color: #E2E8F0;
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 500;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-xs);
      cursor: pointer;
      transition: background-color 120ms ease, border-color 120ms ease;
    }

    .code-copy-btn:hover {
      background-color: #334155;
      border-color: #94A3B8;
    }

    .code-body {
      display: grid;
      grid-template-columns: auto 1fr;
      padding: var(--space-4) 0;
      overflow-x: auto;
    }

    .code-lines {
      user-select: none;
      padding: 0 var(--space-3) 0 var(--space-4);
      text-align: right;
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      line-height: 1.65;
      color: #64748B;
      border-right: 1px solid #1E293B;
    }

    .code-pre {
      margin: 0;
      padding: 0 var(--space-5);
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      line-height: 1.65;
      color: var(--code-text);
      overflow-x: auto;
    }

    /* 2. The Problem Section (2x3 Grid) */
    .problem-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid var(--color-border-grid);
    }

    .problem-cell {
      padding: var(--space-8) var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-4);
    }

    .problem-cell:nth-child(2n) {
      border-right: none;
    }

    .problem-cell:nth-last-child(-n+2) {
      border-bottom: none;
    }

    .problem-statement {
      font-size: var(--text-xl);
      font-weight: 600;
      line-height: 1.38;
      letter-spacing: -0.015em;
      color: var(--color-slate);
      max-width: 46ch;
    }

    .problem-diagram-cell {
      background-color: var(--color-bg-subtle);
      justify-content: center;
    }

    .diagram-svg {
      width: 100%;
      height: auto;
      max-height: 160px;
      display: block;
    }

    /* 3. Value Points Section (2x4 Grid) */
    .value-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid var(--color-border-grid);
    }

    .value-cell {
      padding: var(--space-8) var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .value-cell:nth-child(2n) {
      border-right: none;
    }

    .value-cell:nth-last-child(-n+2) {
      border-bottom: none;
    }

    .value-cell-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .value-cell h3 {
      font-size: var(--text-xl);
      font-weight: 700;
      letter-spacing: -0.015em;
      color: var(--color-slate);
      line-height: 1.3;
    }

    .value-cell p {
      color: var(--color-ink-secondary);
      font-size: var(--text-base);
      max-width: 58ch;
    }

    .decision-diagram-bar {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      border-bottom: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-subtle);
    }

    .decision-diagram-copy {
      padding: var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--space-2);
    }

    .decision-diagram-copy h3 {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--color-slate);
    }

    .decision-diagram-copy p {
      font-size: var(--text-sm);
      color: var(--color-ink-secondary);
    }

    .decision-diagram-canvas {
      padding: var(--space-5) var(--space-6);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-bg-surface);
    }

    /* 4. Code Walk-Through Section */
    .walkthrough-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid var(--color-border-grid);
    }

    .walkthrough-item {
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .walkthrough-item:nth-child(2n) {
      border-right: none;
    }

    .walkthrough-item.full-span {
      grid-column: 1 / -1;
      border-right: none;
      border-bottom: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .walkthrough-caption {
      padding: var(--space-5) var(--space-6);
      background-color: var(--color-bg-surface);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .walkthrough-item.full-span .walkthrough-caption {
      border-bottom: none;
      border-right: 1px solid var(--color-border-grid);
      justify-content: center;
    }

    .walkthrough-caption h3 {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-slate);
    }

    .walkthrough-caption p {
      font-size: var(--text-sm);
      color: var(--color-ink-secondary);
    }

    /* 5. Comparison Table Section */
    .table-scroll-wrapper {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border-bottom: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-surface);
    }

    .comparison-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 780px;
      font-size: var(--text-sm);
    }

    .comparison-table th,
    .comparison-table td {
      padding: var(--space-3) var(--space-4);
      text-align: left;
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      vertical-align: top;
      line-height: 1.45;
    }

    .comparison-table th:last-child,
    .comparison-table td:last-child {
      border-right: none;
    }

    .comparison-table tbody tr:last-child th,
    .comparison-table tbody tr:last-child td {
      border-bottom: none;
    }

    .comparison-table thead th {
      background-color: var(--color-bg-subtle);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-ink);
      white-space: nowrap;
    }

    .comparison-table tbody th {
      background-color: var(--color-bg-surface);
      font-weight: 600;
      color: var(--color-slate);
      position: sticky;
      left: 0;
      z-index: 2;
      box-shadow: 1px 0 0 var(--color-border-grid);
    }

    .comparison-table thead th:first-child {
      position: sticky;
      left: 0;
      z-index: 3;
      box-shadow: 1px 0 0 var(--color-border-grid);
    }

    .comparison-table th.col-featured {
      background-color: var(--color-grant-surface);
      color: var(--color-grant);
      border-bottom: 2px solid var(--color-grant);
    }

    .comparison-table td.col-featured {
      background-color: var(--color-grant-surface);
      font-weight: 600;
      color: var(--color-ink);
    }

    .comparison-honest-bar {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: var(--space-6);
      padding: var(--space-6);
      border-bottom: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-subtle);
    }

    .comparison-honest-text {
      font-size: var(--text-base);
      color: var(--color-ink-secondary);
      max-width: var(--measure-prose);
    }

    .comparison-honest-text strong {
      color: var(--color-slate);
      font-weight: 600;
    }

    /* 6. When Not To Use It Section */
    .not-for-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid var(--color-border-grid);
    }

    .not-for-cell {
      padding: var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .not-for-cell:nth-child(2n) {
      border-right: none;
    }

    .not-for-cell.full-row {
      grid-column: 1 / -1;
      border-right: none;
      border-bottom: none;
      background-color: var(--color-deny-surface);
    }

    .not-for-condition {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-slate);
    }

    .not-for-recommendation {
      font-size: var(--text-base);
      color: var(--color-ink-secondary);
    }

    .not-for-cell.full-row .not-for-condition {
      color: var(--color-deny);
    }

    /* 7. Install Steps Section (2x3 Grid) */
    .install-steps-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid var(--color-border-grid);
    }

    .install-step-cell {
      padding: var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-4);
      min-width: 0;
    }

    .install-step-cell:nth-child(2n) {
      border-right: none;
    }

    .install-step-cell:nth-last-child(-n+2) {
      border-bottom: none;
    }

    .step-command-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      background-color: var(--code-bg);
      color: var(--code-text);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      border: 1px solid var(--code-border);
      overflow-x: auto;
    }

    .step-command-bar code {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--code-text);
      white-space: nowrap;
      overflow-x: auto;
    }

    .step-prose-note {
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-subtle);
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--color-ink);
    }

    /* 8. FAQ Section (2x4 Grid) */
    .faq-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-bottom: 1px solid var(--color-border-grid);
    }

    .faq-cell {
      padding: var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .faq-cell:nth-child(2n) {
      border-right: none;
    }

    .faq-cell:nth-last-child(-n+2) {
      border-bottom: none;
    }

    .faq-cell h3 {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-slate);
    }

    .faq-cell p {
      font-size: var(--text-sm);
      color: var(--color-ink-secondary);
      max-width: 60ch;
    }

    /* 9. Final Install Block */
    .closing-install {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border-bottom: 1px solid var(--color-border-grid);
      background-color: var(--color-bg-subtle);
    }

    .closing-copy {
      padding: var(--space-12) var(--space-8);
      border-right: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--space-3);
    }

    .closing-copy h2 {
      font-size: var(--text-2xl);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--color-slate);
    }

    .closing-copy p {
      color: var(--color-ink-secondary);
      font-size: var(--text-base);
      max-width: 50ch;
    }

    .closing-action {
      padding: var(--space-12) var(--space-8);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: var(--space-4);
    }

    /* 10. Footer */
    .site-footer {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      background-color: var(--color-bg-surface);
    }

    .footer-meta-cell {
      padding: var(--space-8) var(--space-6);
      border-right: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-6);
    }

    .footer-facts {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      color: var(--color-ink-muted);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .footer-links-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .footer-link-cell {
      padding: var(--space-4) var(--space-5);
      border-right: 1px solid var(--color-border-grid);
      border-bottom: 1px solid var(--color-border-grid);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-1);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      transition: background-color 120ms ease;
    }

    .footer-link-cell:nth-child(3n) {
      border-right: none;
    }

    .footer-link-cell:nth-last-child(-n+3) {
      border-bottom: none;
    }

    .footer-link-cell:hover {
      background-color: var(--color-bg-subtle);
    }

    .footer-link-label {
      color: var(--color-ink);
      font-weight: 600;
    }

    .footer-link-sub {
      color: var(--color-ink-muted);
      font-size: 0.7rem;
    }

    /* Responsive Breakpoints (1024px and 390px phone) */
    @media (max-width: 1024px) {
      .hero-grid,
      .section-intro,
      .decision-diagram-bar,
      .walkthrough-grid,
      .walkthrough-item.full-span,
      .closing-install,
      .site-footer {
        grid-template-columns: 1fr;
      }

      .hero-copy-cell,
      .section-intro-title,
      .decision-diagram-copy,
      .walkthrough-item,
      .walkthrough-item.full-span .walkthrough-caption,
      .closing-copy,
      .footer-meta-cell {
        border-right: none;
      }

      .hero-copy-cell,
      .section-intro-title,
      .decision-diagram-copy,
      .walkthrough-item.full-span .walkthrough-caption,
      .closing-copy,
      .footer-meta-cell {
        border-bottom: 1px solid var(--color-border-grid);
      }

      .walkthrough-item:last-child {
        border-bottom: none;
      }

      .hero-spec-strip {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .hero-spec-item:nth-child(2) {
        border-right: none;
      }

      .hero-spec-item:nth-child(-n+2) {
        border-bottom: 1px solid var(--color-border-grid);
      }
    }

    @media (max-width: 720px) {
      .site-header {
        grid-template-columns: 1fr;
      }

      .brand-cell {
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--color-border-grid);
      }

      .site-nav {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
      }

      .site-nav a {
        justify-content: center;
        padding: var(--space-3) var(--space-2);
      }

      .site-nav a:first-child {
        border-left: none;
      }

      .hero-spec-strip,
      .problem-grid,
      .value-grid,
      .not-for-grid,
      .install-steps-grid,
      .faq-grid {
        grid-template-columns: 1fr;
      }

      .hero-spec-item {
        border-right: none;
        border-bottom: 1px solid var(--color-border-grid);
        padding: var(--space-2) var(--space-4);
      }

      .hero-spec-item:last-child {
        border-bottom: none;
      }

      .hero-copy-cell {
        padding: var(--space-8) var(--space-4);
      }

      .scope-matrix-panel,
      .section-intro-title,
      .section-intro-desc,
      .problem-cell,
      .value-cell,
      .not-for-cell,
      .install-step-cell,
      .faq-cell,
      .closing-copy,
      .closing-action,
      .footer-meta-cell {
        padding: var(--space-6) var(--space-4);
      }

      .section-bar {
        padding: var(--space-2) var(--space-4);
      }

      .problem-cell,
      .value-cell,
      .not-for-cell,
      .install-step-cell,
      .faq-cell {
        border-right: none;
        border-bottom: 1px solid var(--color-border-grid);
      }

      .problem-cell:last-child,
      .value-cell:last-child,
      .not-for-cell:last-child,
      .install-step-cell:last-child,
      .faq-cell:last-child {
        border-bottom: none;
      }

      .install-command-box {
        flex-direction: column;
      }

      .copy-btn-primary {
        padding: var(--space-3) var(--space-4);
        width: 100%;
      }

      .scope-2x2 {
        grid-template-columns: 1fr;
      }

      .scope-cell {
        border-right: none;
        border-bottom: 1px solid var(--color-border-grid);
        min-height: auto;
      }

      .scope-cell:last-child {
        border-bottom: none;
      }

      .comparison-honest-bar {
        grid-template-columns: 1fr;
        padding: var(--space-6) var(--space-4);
      }

      .comparison-table tbody th,
      .comparison-table thead th:first-child {
        max-width: 135px;
        min-width: 120px;
        white-space: normal;
      }

      .footer-links-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .footer-link-cell:nth-child(3n) {
        border-right: 1px solid var(--color-border-grid);
      }

      .footer-link-cell:nth-child(2n) {
        border-right: none;
      }

      .footer-link-cell {
        border-bottom: 1px solid var(--color-border-grid);
      }

      .footer-link-cell:last-child {
        grid-column: 1 / -1;
        border-right: none;
        border-bottom: none;
      }
    }

    /* Root fix (phone 390 px): grid children may shrink. */
    .hero-grid > *,
    .closing-install > * { min-width: 0; }
    @media (max-width: 1024px) {
      .hero-grid,
      .closing-install { grid-template-columns: minmax(0, 1fr); }
    }
  </style>
</head>
<body>
  <div class="page-frame">

    <!-- HEADER -->
    <header class="site-header">
      <div class="brand-cell">
        <div class="brand-lockup">
          <svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Access Profiles">
            <g fill="none" stroke="#1E293B" stroke-width="6" stroke-linecap="square">
              <rect x="8" y="8" width="48" height="48" rx="8"/>
              <line x1="32" y1="8" x2="32" y2="56"/>
              <line x1="8" y1="32" x2="56" y2="32"/>
            </g>
            <rect fill="#1F6F78" x="38" y="14" width="12" height="12" rx="2"/>
          </svg>
          <span class="brand-name">Access Profiles</span>
        </div>
        <span class="header-meta">v0.1.0 · MIT</span>
      </div>
      <nav class="site-nav" aria-label="Primary">
        <a href="https://github.com/seisigmasrl/laravel-access-profiles#readme">Docs</a>
        <a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md">Comparison</a>
        <a href="https://github.com/seisigmasrl/laravel-access-profiles">GitHub</a>
      </nav>
    </header>

    <main>
      <!-- HERO -->
      <section aria-labelledby="hero-heading">
        <div class="hero-spec-strip">
          <div class="hero-spec-item">
            <span>PACKAGE</span>
            <strong>seisigmasrl/laravel-access-profiles</strong>
          </div>
          <div class="hero-spec-item">
            <span>NAMESPACE</span>
            <strong>Seisigma\AccessProfiles</strong>
          </div>
          <div class="hero-spec-item">
            <span>RUNTIME</span>
            <strong>PHP 8.3+ · Laravel 12.69+ / 13.30+</strong>
          </div>
          <div class="hero-spec-item">
            <span>RELEASE</span>
            <strong>0.1.0 (2026-10-28)</strong>
          </div>
        </div>

        <div class="hero-grid">
          <div class="hero-copy-cell">
            <div>
              <div class="spec-tag">
                <span class="spec-dot grant"></span>
                <span>00 / SCOPED ACCESS CONTROL</span>
              </div>
              <h1 id="hero-heading" class="hero-headline">Different permissions in different parts of a tenant.</h1>
              <p class="hero-subline">Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.</p>
            </div>

            <div class="hero-actions">
              <div class="install-command-box">
                <div class="install-prompt">
                  <span class="install-prompt-prefix">$</span>
                  <code>composer require seisigmasrl/laravel-access-profiles</code>
                </div>
                <button type="button" class="copy-btn-primary" data-copy="composer require seisigmasrl/laravel-access-profiles">
                  Copy
                </button>
              </div>
              <div class="hero-secondary-row">
                <a class="btn-secondary" href="https://github.com/seisigmasrl/laravel-access-profiles">
                  View on GitHub
                </a>
                <span class="hero-footnote">Works next to Laravel's Gate. Access is denied by default.</span>
              </div>
            </div>
          </div>

          <div class="hero-visual-cell">
            <div class="scope-matrix-panel">
              <div class="scope-matrix-header">
                <span class="spec-tag">TENANT: $team (4 SCOPES)</span>
                <span class="badge badge-grant">2 SCOPES GRANTED</span>
              </div>
              <div class="scope-2x2" role="region" aria-label="Tenant scope assignment diagram">
                <div class="scope-cell is-granted">
                  <div class="scope-cell-top">
                    <span>SCOPE // $site</span>
                    <span class="badge badge-grant">GRANTED</span>
                  </div>
                  <div class="scope-cell-meta">profile: reviewer · titled: Review cover</div>
                </div>
                <div class="scope-cell is-granted">
                  <div class="scope-cell-top">
                    <span>SCOPE // $otherSite</span>
                    <span class="badge badge-grant">GRANTED</span>
                  </div>
                  <div class="scope-cell-meta">profile: reviewer · valid 6 months</div>
                </div>
                <div class="scope-cell">
                  <div class="scope-cell-top">
                    <span>SCOPE // site 3</span>
                    <span class="badge">DEFAULT NO</span>
                  </div>
                  <div class="scope-cell-meta">not in onlyScopes()</div>
                </div>
                <div class="scope-cell">
                  <div class="scope-cell-top">
                    <span>SCOPE // site 4</span>
                    <span class="badge">DEFAULT NO</span>
                  </div>
                  <div class="scope-cell-meta">not in onlyScopes()</div>
                </div>
              </div>
            </div>

            <div class="code-panel">
              <div class="code-panel-bar">
                <span class="code-file-label">grant.php</span>
                <button type="button" class="code-copy-btn" data-copy-target="hero-code-grant">Copy</button>
              </div>
              <div class="code-body">
                <div class="code-lines" aria-hidden="true">1<br>2<br>3<br>4</div>
                <pre class="code-pre"><code id="hero-code-grant">$assignment = Access::grant('reviewer')-&gt;to($user)-&gt;in($team)
    -&gt;onlyScopes([$site, $otherSite])-&gt;titled('Review cover')
    -&gt;validFrom(now())-&gt;validUntil(now()-&gt;addMonths(6))
    -&gt;by($admin)-&gt;because('Cover leave')-&gt;save();</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- THE PROBLEM -->
      <section aria-labelledby="problem-heading">
        <div class="section-bar">
          <span class="spec-tag"><span class="spec-dot"></span> 01 / THE PROBLEM</span>
          <span class="spec-tag">MULTI-TENANT REALITIES</span>
        </div>

        <div class="section-intro">
          <div class="section-intro-title">
            <h2 id="problem-heading">The problem</h2>
          </div>
          <div class="section-intro-desc">
            <p>Tenants, scopes and holders are your own Eloquent models. A team can be a tenant and its sites can be scopes. Real access inside a tenant is rarely one flat role across every scope.</p>
          </div>
        </div>

        <div class="problem-grid">
          <div class="problem-cell">
            <span class="spec-tag">CASE 01 // SCOPED ROLES</span>
            <p class="problem-statement">Manager in two sites, read-only in a third — same person, same tenant.</p>
          </div>
          <div class="problem-cell">
            <span class="spec-tag">CASE 02 // TIME &amp; TITLE</span>
            <p class="problem-statement">Temporary access (an external auditor until a date) and appointed access (a title such as "Board treasurer").</p>
          </div>
          <div class="problem-cell">
            <span class="spec-tag"><span class="spec-dot deny"></span> CASE 03 // BROAD ALLOW WITH EXCEPTION</span>
            <p class="problem-statement">A broad grant with one hole: everything in billing, except approving payments.</p>
          </div>
          <div class="problem-cell">
            <span class="spec-tag">CASE 04 // REVERSE LOOKUP</span>
            <p class="problem-statement">"Who can approve payments in site 4?" must be a query, not a loop over every user.</p>
          </div>
          <div class="problem-cell">
            <span class="spec-tag">CASE 05 // AUDIT RECORD</span>
            <p class="problem-statement">"Who gave this person access, and why?"</p>
          </div>
          <div class="problem-cell problem-diagram-cell">
            <span class="spec-tag">DIAGRAM // TENANT → SCOPES → ASSIGNMENT</span>
            <svg class="diagram-svg" viewBox="0 0 520 130" role="img" aria-label="Tenant to scopes to assignment relationship">
              <rect x="4" y="16" width="128" height="98" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
              <text x="18" y="38" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="currentColor">TENANT ($team)</text>
              <rect x="18" y="50" width="44" height="22" rx="2" fill="#1F6F78"/>
              <text x="25" y="65" font-family="JetBrains Mono, monospace" font-size="10" fill="#FFFFFF">site 1</text>
              <rect x="70" y="50" width="44" height="22" rx="2" fill="#1F6F78"/>
              <text x="77" y="65" font-family="JetBrains Mono, monospace" font-size="10" fill="#FFFFFF">site 2</text>
              <rect x="18" y="80" width="44" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <text x="25" y="95" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">site 3</text>
              <rect x="70" y="80" width="44" height="22" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <text x="77" y="95" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">site 4</text>

              <line x1="132" y1="65" x2="188" y2="65" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
              <polygon points="188,61 196,65 188,69" fill="currentColor"/>

              <rect x="196" y="16" width="148" height="98" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
              <text x="210" y="38" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="currentColor">PROFILE: reviewer</text>
              <text x="210" y="62" font-family="JetBrains Mono, monospace" font-size="11" fill="#1F6F78">+ allow: billing.*</text>
              <text x="210" y="84" font-family="JetBrains Mono, monospace" font-size="11" fill="#991B1B">- deny:  ...approve</text>

              <line x1="344" y1="65" x2="386" y2="65" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
              <polygon points="386,61 394,65 386,69" fill="currentColor"/>

              <rect x="394" y="16" width="122" height="98" rx="6" fill="none" stroke="currentColor" stroke-width="2"/>
              <text x="406" y="38" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="currentColor">ASSIGNMENT</text>
              <text x="406" y="58" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">holder: $user</text>
              <text x="406" y="76" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">by:     $admin</text>
              <text x="406" y="94" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">until:  +6m</text>
            </svg>
          </div>
        </div>
      </section>

      <!-- VALUE POINTS -->
      <section aria-labelledby="values-heading">
        <div class="section-bar">
          <span class="spec-tag"><span class="spec-dot grant"></span> 02 / VALUE POINTS</span>
          <span class="spec-tag">EACH POINT HAS A TEST IN THE REPO</span>
        </div>

        <div class="section-intro">
          <div class="section-intro-title">
            <h2 id="values-heading">Built as a precise instrument.</h2>
          </div>
          <div class="section-intro-desc">
            <p>Profiles combine allow and deny rules. Assignments cover a whole tenant or selected scopes, with validity dates and a record of who granted access and why.</p>
          </div>
        </div>

        <div class="value-grid">
          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">01 // SCOPE SET</span>
              <span class="badge badge-grant">SCOPED</span>
            </div>
            <h3>Access per scope set, not per tenant.</h3>
            <p>One assignment covers the whole tenant or a chosen list of scopes.</p>
          </div>

          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">02 // PRECEDENCE</span>
              <span class="badge badge-deny">DENY WINS</span>
            </div>
            <h3>Deny wins. Default is no.</h3>
            <p>Any matching deny beats every allow, in any order. With no rule, the answer is false.</p>
          </div>

          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">03 // VALIDITY BOUNDARIES</span>
              <span class="badge">NO SCHEDULER</span>
            </div>
            <h3>Access that ends on time, without a scheduler.</h3>
            <p>Start dates are inclusive, end dates exclusive. The cache TTL stops at the next boundary.</p>
          </div>

          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">04 // AUDIT TRAIL</span>
              <span class="badge">HISTORY</span>
            </div>
            <h3>Who, why, and when — on every grant.</h3>
            <p>Each assignment stores the grantor and the reason. Revoked rows stay as history. Write events fire after commit.</p>
          </div>

          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">05 // HOLDER QUERY</span>
              <span class="badge badge-grant">1 QUERY</span>
            </div>
            <h3>"Who can do X here?" is one query.</h3>
            <p><code>Access::holders()</code> applies deny, scope, validity and conditions, and returns a builder you can paginate.</p>
          </div>

          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">06 // GUARDRAILS</span>
              <span class="badge">SAFE DEFAULT</span>
            </div>
            <h3>Safe grants by default.</h3>
            <p>Guards reject self-assignment and escalation. Scopes must belong to the tenant. Rejections write nothing.</p>
          </div>

          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">07 // STATELESS EVALUATION</span>
              <span class="badge">OCTANE + QUEUES</span>
            </div>
            <h3>No global tenant state, no owner bypass.</h3>
            <p>Every check takes a target. Safe with Octane and queued jobs. Owners get a full profile like anyone else.</p>
          </div>

          <div class="value-cell">
            <div class="value-cell-header">
              <span class="spec-tag">08 // FOOTPRINT</span>
              <span class="badge">ILLUMINATE ONLY</span>
            </div>
            <h3>Small footprint, tested docs.</h3>
            <p>PHP and <code>illuminate/*</code> only. Every README example has a behaviour test.</p>
          </div>
        </div>

        <div class="decision-diagram-bar">
          <div class="decision-diagram-copy">
            <span class="spec-tag">DECISION RULE // DENY WINS</span>
            <h3>How a permission check resolves</h3>
            <p>Active assignments in the target scope are collected. If any matching rule denies the permission, access is refused immediately.</p>
          </div>
          <div class="decision-diagram-canvas">
            <svg class="diagram-svg" viewBox="0 0 600 96" role="img" aria-label="Deny-wins decision flow">
              <rect x="6" y="22" width="150" height="52" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <text x="18" y="44" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="currentColor">1. Active scopes</text>
              <text x="18" y="61" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">valid_from .. until</text>

              <line x1="156" y1="48" x2="196" y2="48" stroke="currentColor" stroke-width="1.5"/>
              <polygon points="196,44 204,48 196,52" fill="currentColor"/>

              <rect x="204" y="22" width="166" height="52" rx="4" fill="none" stroke="#991B1B" stroke-width="2"/>
              <text x="216" y="44" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="#991B1B">2. Matching deny?</text>
              <text x="216" y="61" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">Yes → return false</text>

              <line x1="370" y1="48" x2="410" y2="48" stroke="currentColor" stroke-width="1.5"/>
              <polygon points="410,44 418,48 410,52" fill="currentColor"/>

              <rect x="418" y="22" width="176" height="52" rx="4" fill="none" stroke="#1F6F78" stroke-width="2"/>
              <text x="430" y="44" font-family="JetBrains Mono, monospace" font-size="11" font-weight="600" fill="#1F6F78">3. Matching allow?</text>
              <text x="430" y="61" font-family="JetBrains Mono, monospace" font-size="10" fill="currentColor">Yes → true (else false)</text>
            </svg>
          </div>
        </div>
      </section>

      <!-- CODE WALK-THROUGH -->
      <section aria-labelledby="code-heading">
        <div class="section-bar">
          <span class="spec-tag"><span class="spec-dot grant"></span> 03 / CODE WALK-THROUGH</span>
          <span class="spec-tag">EXACT API SURFACE</span>
        </div>

        <div class="section-intro">
          <div class="section-intro-title">
            <h2 id="code-heading">Code walk-through</h2>
          </div>
          <div class="section-intro-desc">
            <p>Define profiles with allow and deny rules, grant assignments to holders across selected scopes, check or explain decisions, and query holders directly.</p>
          </div>
        </div>

        <div class="walkthrough-grid">
          <!-- 1. profile.php -->
          <div class="walkthrough-item">
            <div class="walkthrough-caption">
              <span class="spec-tag">STEP A // DEFINE PROFILE</span>
              <h3>Allow a wildcard, deny a specific action</h3>
              <p>Any matching deny beats every allow in the same tenant.</p>
            </div>
            <div class="code-panel">
              <div class="code-panel-bar">
                <span class="code-file-label">profile.php</span>
                <button type="button" class="code-copy-btn" data-copy-target="code-profile">Copy</button>
              </div>
              <div class="code-body">
                <div class="code-lines" aria-hidden="true">1<br>2<br>3</div>
                <pre class="code-pre"><code id="code-profile">$profile = Access::profile('reviewer')-&gt;in($team)
    -&gt;allow('billing.*')-&gt;deny('billing.invoice.approve')
    -&gt;by($admin)-&gt;because('Keep approvals separate')-&gt;save();</code></pre>
              </div>
            </div>
          </div>

          <!-- 2. grant.php -->
          <div class="walkthrough-item">
            <div class="walkthrough-caption">
              <span class="spec-tag">STEP B // ASSIGN TO HOLDER</span>
              <h3>Grant across selected scopes with validity and reason</h3>
              <p>Covers a chosen list of scopes, with a title, dates, grantor and reason.</p>
            </div>
            <div class="code-panel">
              <div class="code-panel-bar">
                <span class="code-file-label">grant.php</span>
                <button type="button" class="code-copy-btn" data-copy-target="code-grant">Copy</button>
              </div>
              <div class="code-body">
                <div class="code-lines" aria-hidden="true">1<br>2<br>3<br>4</div>
                <pre class="code-pre"><code id="code-grant">$assignment = Access::grant('reviewer')-&gt;to($user)-&gt;in($team)
    -&gt;onlyScopes([$site, $otherSite])-&gt;titled('Review cover')
    -&gt;validFrom(now())-&gt;validUntil(now()-&gt;addMonths(6))
    -&gt;by($admin)-&gt;because('Cover leave')-&gt;save();</code></pre>
              </div>
            </div>
          </div>

          <!-- 3. check.php -->
          <div class="walkthrough-item">
            <div class="walkthrough-caption">
              <span class="spec-tag">STEP C // CHECK &amp; EXPLAIN</span>
              <h3>Evaluate permissions against a target scope</h3>
              <p>Call <code>canAccess()</code> from your policies or inspect the decision with <code>explain()</code>.</p>
            </div>
            <div class="code-panel">
              <div class="code-panel-bar">
                <span class="code-file-label">check.php</span>
                <button type="button" class="code-copy-btn" data-copy-target="code-check">Copy</button>
              </div>
              <div class="code-body">
                <div class="code-lines" aria-hidden="true">1<br>2<br>3</div>
                <pre class="code-pre"><code id="code-check">$allowed = Access::for($user)-&gt;can('billing.invoice.view', $site);
$sameAnswer = $user-&gt;canAccess('billing.invoice.view', $site);
$decision = Access::for($user)-&gt;explain('billing.invoice.approve', $site);</code></pre>
              </div>
            </div>
          </div>

          <!-- 4. query.php -->
          <div class="walkthrough-item">
            <div class="walkthrough-caption">
              <span class="spec-tag">STEP D // QUERY HOLDERS &amp; HISTORY</span>
              <h3>Find every holder who can perform an action</h3>
              <p>Query holders or counts for a permission in a scope, and inspect grant history.</p>
            </div>
            <div class="code-panel">
              <div class="code-panel-bar">
                <span class="code-file-label">query.php</span>
                <button type="button" class="code-copy-btn" data-copy-target="code-query">Copy</button>
              </div>
              <div class="code-body">
                <div class="code-lines" aria-hidden="true">1<br>2<br>3</div>
                <pre class="code-pre"><code id="code-query">$holders = Access::holders('billing.invoice.view', $site);
$count = Access::holdersQuery('billing.invoice.view', $site)-&gt;count();
$history = Access::history($user, $team);</code></pre>
              </div>
            </div>
          </div>

          <!-- 5. Blade -->
          <div class="walkthrough-item full-span">
            <div class="walkthrough-caption">
              <span class="spec-tag">STEP E // BLADE DIRECTIVE</span>
              <h3>Check scoped access in templates</h3>
              <p>Works next to Laravel's Gate, not instead of it. <code>$user-&gt;can()</code> and Gate keep their normal behaviour.</p>
            </div>
            <div class="code-panel">
              <div class="code-panel-bar">
                <span class="code-file-label">Blade</span>
                <button type="button" class="code-copy-btn" data-copy-target="code-blade">Copy</button>
              </div>
              <div class="code-body">
                <div class="code-lines" aria-hidden="true">1<br>2<br>3</div>
                <pre class="code-pre"><code id="code-blade">@canAccess('billing.invoice.view', $site)
View invoices
@endcanAccess</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- COMPARISON -->
      <section aria-labelledby="comparison-heading">
        <div class="section-bar">
          <span class="spec-tag"><span class="spec-dot"></span> 04 / COMPARISON</span>
          <span class="spec-tag">CHECKED ON 2026-10-28</span>
        </div>

        <div class="section-intro">
          <div class="section-intro-title">
            <h2 id="comparison-heading">Comparison</h2>
          </div>
          <div class="section-intro-desc">
            <p>Checked on 2026-10-28 across access-profiles 0.1.0, spatie/laravel-permission 8.3.2, silber/bouncer v1.0.4, santigarcor/laratrust 8.5.6, and Laravel 13.x Gate.</p>
          </div>
        </div>

        <div class="table-scroll-wrapper" role="region" aria-label="Package comparison table" tabindex="0">
          <table class="comparison-table">
            <thead>
              <tr>
                <th scope="col">Row</th>
                <th scope="col" class="col-featured">Access Profiles</th>
                <th scope="col">spatie/laravel-permission</th>
                <th scope="col">Bouncer</th>
                <th scope="col">Laratrust</th>
                <th scope="col">Gate + policies</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Multi-tenant scope</th>
                <td class="col-featured">Tenant + scopes inside it</td>
                <td>One team dimension</td>
                <td>One tenant id per request</td>
                <td>One team, passed per call</td>
                <td>You write it</td>
              </tr>
              <tr>
                <th scope="row">One assignment → a set of scopes</th>
                <td class="col-featured">Yes</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>You write it</td>
              </tr>
              <tr>
                <th scope="row">Deny</th>
                <td class="col-featured">Yes, deny wins</td>
                <td>—</td>
                <td>Yes, <code>forbid()</code></td>
                <td>—</td>
                <td>You write it</td>
              </tr>
              <tr>
                <th scope="row">Validity window</th>
                <td class="col-featured"><code>valid_from</code> / <code>valid_until</code></td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>You write it</td>
              </tr>
              <tr>
                <th scope="row">Grantor + reason audit</th>
                <td class="col-featured">Yes, plus write events</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>You write it</td>
              </tr>
              <tr>
                <th scope="row">"Who can do X here?"</th>
                <td class="col-featured"><code>Access::holders()</code></td>
                <td><code>User::permission()</code> for the current team</td>
                <td>By role only</td>
                <td><code>whereHasPermission()</code></td>
                <td>Loop over users</td>
              </tr>
              <tr>
                <th scope="row">Global tenant state</th>
                <td class="col-featured">None; target per check</td>
                <td>Global team id</td>
                <td>Static scope</td>
                <td>None</td>
                <td>None</td>
              </tr>
              <tr>
                <th scope="row">Owner / super-admin</th>
                <td class="col-featured">No bypass</td>
                <td><code>Gate::before</code></td>
                <td><code>everything()</code></td>
                <td>Role check</td>
                <td><code>Gate::before</code></td>
              </tr>
              <tr>
                <th scope="row">Laravel versions</th>
                <td class="col-featured">12.69+, 13.30+</td>
                <td>12, 13</td>
                <td>11, 12, 13</td>
                <td>10, 11, 12, 13</td>
                <td>—</td>
              </tr>
              <tr>
                <th scope="row">Maintenance</th>
                <td class="col-featured">New: 0.1.0 (2026-10-28)</td>
                <td>Active</td>
                <td>Slow (about one release a year)</td>
                <td>Active</td>
                <td>Laravel core</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="comparison-honest-bar">
          <p class="comparison-honest-text">
            <strong>Honest reading:</strong> spatie/laravel-permission is the safe default for one tenant or one team level, with the biggest community. Bouncer is the closest in spirit (it has deny). Laratrust passes the team explicitly. Plain Gate + policies is enough when roles are few and fixed.
          </p>
          <a class="btn-secondary" href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md">
            Full comparison with sources
          </a>
        </div>
      </section>

      <!-- WHEN NOT TO USE IT -->
      <section aria-labelledby="not-to-use-heading">
        <div class="section-bar">
          <span class="spec-tag"><span class="spec-dot deny"></span> 05 / BOUNDARIES</span>
          <span class="spec-tag">WHEN NOT TO USE IT</span>
        </div>

        <div class="section-intro">
          <div class="section-intro-title">
            <h2 id="not-to-use-heading">When not to use it</h2>
          </div>
          <div class="section-intro-desc">
            <p>Choose the simplest tool that matches your access model.</p>
          </div>
        </div>

        <div class="not-for-grid">
          <div class="not-for-cell">
            <span class="spec-tag">BOUNDARY 01</span>
            <p class="not-for-condition">One tenant or one flat team level</p>
            <p class="not-for-recommendation">→ consider spatie/laravel-permission.</p>
          </div>
          <div class="not-for-cell">
            <span class="spec-tag">BOUNDARY 02</span>
            <p class="not-for-condition">A few fixed roles</p>
            <p class="not-for-recommendation">→ Laravel's Gates and policies may be enough.</p>
          </div>
          <div class="not-for-cell">
            <span class="spec-tag">BOUNDARY 03</span>
            <p class="not-for-condition">Record-level rules</p>
            <p class="not-for-recommendation">→ keep them in a policy.</p>
          </div>
          <div class="not-for-cell">
            <span class="spec-tag">BOUNDARY 04</span>
            <p class="not-for-condition">An admin UI out of the box</p>
            <p class="not-for-recommendation">→ build your own screens.</p>
          </div>
          <div class="not-for-cell full-row">
            <span class="spec-tag"><span class="spec-dot deny"></span> BOUNDARY 05 // MATURITY</span>
            <p class="not-for-condition">A mature, proven package today</p>
            <p class="not-for-recommendation">→ this package is new. Review it before relying on it for access control.</p>
          </div>
        </div>
      </section>

      <!-- INSTALL STEPS -->
      <section aria-labelledby="install-heading">
        <div class="section-bar">
          <span class="spec-tag"><span class="spec-dot grant"></span> 06 / INSTALLATION</span>
          <span class="spec-tag">6 STEPS</span>
        </div>

        <div class="section-intro">
          <div class="section-intro-title">
            <h2 id="install-heading">Install steps</h2>
          </div>
          <div class="section-intro-desc">
            <p>Requires PHP 8.3+ and Laravel 12.69+ or 13.30+. Runtime dependencies: PHP and 8 <code>illuminate/*</code> packages only.</p>
          </div>
        </div>

        <div class="install-steps-grid">
          <div class="install-step-cell">
            <span class="spec-tag">STEP 01 // REQUIRE PACKAGE</span>
            <div class="step-command-bar">
              <code>composer require seisigmasrl/laravel-access-profiles</code>
              <button type="button" class="code-copy-btn" data-copy="composer require seisigmasrl/laravel-access-profiles">Copy</button>
            </div>
          </div>

          <div class="install-step-cell">
            <span class="spec-tag">STEP 02 // PUBLISH CONFIG</span>
            <div class="step-command-bar">
              <code>php artisan vendor:publish --tag=access-profiles-config</code>
              <button type="button" class="code-copy-btn" data-copy="php artisan vendor:publish --tag=access-profiles-config">Copy</button>
            </div>
          </div>

          <div class="install-step-cell">
            <span class="spec-tag">STEP 03 // PUBLISH MIGRATIONS</span>
            <div class="step-command-bar">
              <code>php artisan vendor:publish --tag=access-profiles-migrations</code>
              <button type="button" class="code-copy-btn" data-copy="php artisan vendor:publish --tag=access-profiles-migrations">Copy</button>
            </div>
          </div>

          <div class="install-step-cell">
            <span class="spec-tag">STEP 04 // CONFIGURE</span>
            <div class="step-prose-note">
              Configure the permission catalogue and templates. Choose table names before migrating.
            </div>
          </div>

          <div class="install-step-cell">
            <span class="spec-tag">STEP 05 // MIGRATE</span>
            <div class="step-command-bar">
              <code>php artisan migrate</code>
              <button type="button" class="code-copy-btn" data-copy="php artisan migrate">Copy</button>
            </div>
          </div>

          <div class="install-step-cell">
            <span class="spec-tag">STEP 06 // SYNC TEMPLATES</span>
            <div class="step-command-bar">
              <code>php artisan access-profiles:sync-templates</code>
              <button type="button" class="code-copy-btn" data-copy="php artisan access-profiles:sync-templates">Copy</button>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section aria-labelledby="faq-heading">
        <div class="section-bar">
          <span class="spec-tag"><span class="spec-dot"></span> 07 / FAQ</span>
          <span class="spec-tag">7 QUESTIONS</span>
        </div>

        <div class="section-intro">
          <div class="section-intro-title">
            <h2 id="faq-heading">Frequently asked questions</h2>
          </div>
          <div class="section-intro-desc">
            <p>Direct answers on how Access Profiles interacts with Laravel's Gate, Octane, queues, Sanctum and existing permission tables.</p>
          </div>
        </div>

        <div class="faq-grid">
          <div class="faq-cell">
            <span class="spec-tag">FAQ 01</span>
            <h3>Does it replace Laravel's Gate?</h3>
            <p>No. Gate and <code>$user-&gt;can()</code> keep their normal behaviour. Call <code>canAccess()</code> or <code>Access::for()</code> from a policy.</p>
          </div>

          <div class="faq-cell">
            <span class="spec-tag">FAQ 02</span>
            <h3>Is there a super-admin or owner bypass?</h3>
            <p>No. An owner gets a full profile like everyone else.</p>
          </div>

          <div class="faq-cell">
            <span class="spec-tag">FAQ 03</span>
            <h3>Is it safe with Octane and queues?</h3>
            <p>There is no global tenant state. Every check takes a target. Jobs re-check when they run.</p>
          </div>

          <div class="faq-cell">
            <span class="spec-tag">FAQ 04</span>
            <h3>Do I need a scheduler for expiry?</h3>
            <p>No. The cache stops at the next validity boundary.</p>
          </div>

          <div class="faq-cell">
            <span class="spec-tag">FAQ 05</span>
            <h3>Does it ship an admin UI?</h3>
            <p>No. Build your own screens.</p>
          </div>

          <div class="faq-cell">
            <span class="spec-tag">FAQ 06</span>
            <h3>Does it work with Sanctum tokens?</h3>
            <p>Optional. With <code>token_intersection</code>, a token can only narrow access. No Sanctum dependency.</p>
          </div>

          <div class="faq-cell">
            <span class="spec-tag">FAQ 07</span>
            <h3>Can I move from another permission package?</h3>
            <p>Yes. Write a <code>BackfillSource</code> and run <code>access-profiles:backfill --dry-run</code> first.</p>
          </div>

          <div class="faq-cell">
            <span class="spec-tag">ARCHITECTURE NOTES</span>
            <h3>Where can I read the internal design notes?</h3>
            <p>Read the <a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/DESIGN.md" style="text-decoration: underline;">Design notes</a> and <a href="https://github.com/seisigmasrl/laravel-access-profiles#readme" style="text-decoration: underline;">README</a> on GitHub.</p>
          </div>
        </div>
      </section>

      <!-- FINAL INSTALL BLOCK -->
      <section class="closing-install" aria-labelledby="closing-heading">
        <div class="closing-copy">
          <span class="spec-tag"><span class="spec-dot grant"></span> 08 / GET STARTED</span>
          <h2 id="closing-heading">Different permissions in different parts of a tenant.</h2>
          <p>Install from Packagist and review the documentation and test suite on GitHub.</p>
        </div>
        <div class="closing-action">
          <div class="install-command-box">
            <div class="install-prompt">
              <span class="install-prompt-prefix">$</span>
              <code>composer require seisigmasrl/laravel-access-profiles</code>
            </div>
            <button type="button" class="copy-btn-primary" data-copy="composer require seisigmasrl/laravel-access-profiles">
              Copy
            </button>
          </div>
          <div class="hero-secondary-row">
            <a class="btn-secondary" href="https://github.com/seisigmasrl/laravel-access-profiles#readme">Read the Docs</a>
            <a class="btn-secondary" href="https://packagist.org/packages/seisigmasrl/laravel-access-profiles">Packagist</a>
            <a class="btn-secondary" href="https://github.com/seisigmasrl/laravel-access-profiles">GitHub</a>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="site-footer">
      <div class="footer-meta-cell">
        <div class="brand-lockup">
          <svg class="brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Access Profiles">
            <g fill="none" stroke="#1E293B" stroke-width="6" stroke-linecap="square">
              <rect x="8" y="8" width="48" height="48" rx="8"/>
              <line x1="32" y1="8" x2="32" y2="56"/>
              <line x1="8" y1="32" x2="56" y2="32"/>
            </g>
            <rect fill="#1F6F78" x="38" y="14" width="12" height="12" rx="2"/>
          </svg>
          <span class="brand-name">Access Profiles</span>
        </div>

        <div class="footer-facts">
          <span>Composer: seisigmasrl/laravel-access-profiles</span>
          <span>Namespace: Seisigma\AccessProfiles</span>
          <span>Version 0.1.0 · Released 2026-10-28 · MIT License</span>
          <span>Author: Ricardo A. Vargas R. (Seisigma SRL)</span>
        </div>
      </div>

      <div class="footer-links-grid">
        <a class="footer-link-cell" href="https://github.com/seisigmasrl/laravel-access-profiles">
          <span class="footer-link-label">GitHub</span>
          <span class="footer-link-sub">Repository</span>
        </a>
        <a class="footer-link-cell" href="https://github.com/seisigmasrl/laravel-access-profiles#readme">
          <span class="footer-link-label">Docs</span>
          <span class="footer-link-sub">README</span>
        </a>
        <a class="footer-link-cell" href="https://packagist.org/packages/seisigmasrl/laravel-access-profiles">
          <span class="footer-link-label">Packagist</span>
          <span class="footer-link-sub">v0.1.0</span>
        </a>
        <a class="footer-link-cell" href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md">
          <span class="footer-link-label">Comparison</span>
          <span class="footer-link-sub">COMPARISON.md</span>
        </a>
        <a class="footer-link-cell" href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/DESIGN.md">
          <span class="footer-link-label">Design notes</span>
          <span class="footer-link-sub">DESIGN.md</span>
        </a>
        <a class="footer-link-cell" href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/CHANGELOG.md">
          <span class="footer-link-label">Changelog</span>
          <span class="footer-link-sub">CHANGELOG.md</span>
        </a>
        <a class="footer-link-cell" href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/LICENSE.md">
          <span class="footer-link-label">License</span>
          <span class="footer-link-sub">MIT</span>
        </a>
        <a class="footer-link-cell" href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/SECURITY.md">
          <span class="footer-link-label">Security</span>
          <span class="footer-link-sub">SECURITY.md</span>
        </a>
        <a class="footer-link-cell" href="/privacy">
          <span class="footer-link-label">Privacy</span>
          <span class="footer-link-sub">/privacy</span>
        </a>
      </div>
    </footer>

  </div>

  <script>
    (function () {
      function copyText(text, button) {
        if (!navigator.clipboard) {
          return;
        }
        var originalLabel = button.textContent;
        navigator.clipboard.writeText(text).then(function () {
          button.textContent = 'Copied';
          setTimeout(function () {
            button.textContent = originalLabel;
          }, 1600);
        });
      }

      var buttons = document.querySelectorAll('[data-copy], [data-copy-target]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function (event) {
          var btn = event.currentTarget;
          var directText = btn.getAttribute('data-copy');
          if (directText) {
            copyText(directText, btn);
            return;
          }
          var targetId = btn.getAttribute('data-copy-target');
          var targetEl = document.getElementById(targetId);
          if (targetEl) {
            copyText(targetEl.textContent, btn);
          }
        });
      }
    })();
  </script>
</body>
</html>

```

### Option "opus"

```html
<!doctype html>
<!--
  Direction: "Quiet Docs"
  1. Stays close to the owner's examples: a short headline that names the job, an install line with a copy button, and file-labelled code with line numbers.
  2. Feels safe, precise and calm: white and slate surfaces, lots of air, and a teal accent used only for links, copy buttons and the one "granted" cell.
  3. Every section reads like good documentation, with a claim, plain facts and the code or diagram next to it. There is no social proof, and no fact comes from outside the pack.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Access Profiles: different permissions in different parts of a tenant</title>
<meta name="description" content="Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  /* Color: light */
  --c-bg:#FFFFFF;
  --c-surface:#F8FAFC;
  --c-surface-2:#F1F5F9;
  --c-border:#E2E8F0;
  --c-border-strong:#CBD5E1;
  --c-text:#1E293B;
  --c-muted:#475569;
  --c-subtle:#64748B;
  --c-accent:#1F6F78;
  --c-accent-hover:#185A62;
  --c-on-accent:#FFFFFF;
  --c-accent-tint:#E8F3F4;
  --c-deny:#A3262F;
  --c-deny-tint:#FBEDEE;
  --c-code-bg:#F8FAFC;
  --c-focus:#1F6F78;
  --logo-stroke:#1E293B;
  --logo-accent:#1F6F78;

  /* Type */
  --font-sans:"Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono:"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --fs-xs:0.8125rem;
  --fs-sm:0.9375rem;
  --fs-base:1.0625rem;
  --fs-lg:1.25rem;
  --fs-xl:1.5rem;
  --fs-2xl:clamp(1.75rem, 1.4rem + 1.2vw, 2.25rem);
  --fs-3xl:clamp(2.25rem, 1.55rem + 2.8vw, 3.5rem);
  --fs-code:0.875rem;
  --lh-tight:1.15;
  --lh-snug:1.35;
  --lh-body:1.65;
  --lh-code:1.7;

  /* Space */
  --space-1:0.25rem;
  --space-2:0.5rem;
  --space-3:0.75rem;
  --space-4:1rem;
  --space-5:1.5rem;
  --space-6:2rem;
  --space-7:3rem;
  --space-8:4rem;
  --space-section:clamp(4.5rem, 3rem + 5vw, 8rem);
  --gutter:clamp(1.25rem, 0.8rem + 2vw, 2.5rem);

  /* Shape and layout */
  --radius-sm:6px;
  --radius-md:10px;
  --radius-lg:14px;
  --measure:70ch;
  --container:74rem;
}
@media (prefers-color-scheme: dark){
  :root{
    --c-bg:#0B1220;
    --c-surface:#111A2B;
    --c-surface-2:#16213A;
    --c-border:#23304A;
    --c-border-strong:#33415C;
    --c-text:#E2E8F0;
    --c-muted:#A6B3C6;
    --c-subtle:#8A99AF;
    --c-accent:#4FB3BD;
    --c-accent-hover:#6CC3CC;
    --c-on-accent:#0B1220;
    --c-accent-tint:#12303A;
    --c-deny:#F2A0A8;
    --c-deny-tint:#3A1A21;
    --c-code-bg:#0E1626;
    --c-focus:#4FB3BD;
    --logo-stroke:#E2E8F0;
    --logo-accent:#4FB3BD;
  }
}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:auto}
body{
  margin:0;background:var(--c-bg);color:var(--c-text);
  font-family:var(--font-sans);font-size:var(--fs-base);line-height:var(--lh-body);
  font-feature-settings:"ss01";-webkit-font-smoothing:antialiased;
}
h1,h2,h3,p,ul,ol,dl,dd,figure{margin:0}
h1,h2,h3{font-weight:700;letter-spacing:-0.015em;line-height:var(--lh-tight)}
a{color:var(--c-accent);text-underline-offset:0.2em;text-decoration-thickness:1px}
a:hover{color:var(--c-accent-hover);text-decoration-thickness:2px}
:focus-visible{outline:2px solid var(--c-focus);outline-offset:3px;border-radius:4px}
code,pre{font-family:var(--font-mono);font-size:var(--fs-code)}
:not(pre)>code{
  background:var(--c-surface-2);border:1px solid var(--c-border);
  padding:0.05em 0.35em;border-radius:4px;font-size:0.86em;white-space:nowrap;
}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;left:var(--space-4);top:-3rem;background:var(--c-accent);color:var(--c-on-accent);padding:var(--space-2) var(--space-4);border-radius:var(--radius-sm);z-index:10}
.skip:focus{top:var(--space-4)}

.container{max-width:var(--container);margin-inline:auto;padding-inline:var(--gutter)}
.section{padding-block:var(--space-section);border-top:1px solid var(--c-border)}
.eyebrow{font-size:var(--fs-xs);font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--c-subtle);margin-bottom:var(--space-3)}
.section-head{max-width:var(--measure);margin-bottom:var(--space-7)}
.section-head h2{font-size:var(--fs-2xl)}
.section-head p{margin-top:var(--space-4);color:var(--c-muted)}
.muted{color:var(--c-muted)}

/* Header */
.site-header{border-bottom:1px solid var(--c-border)}
.site-header .container{display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);min-height:4rem}
.lockup{display:inline-flex;align-items:center;gap:0.6rem;color:var(--c-text);text-decoration:none;font-weight:600;font-size:1.0625rem;letter-spacing:-0.01em;white-space:nowrap}
.lockup:hover{color:var(--c-text);text-decoration:none}
.logo{width:28px;height:28px;flex:none}
.logo g{stroke:var(--logo-stroke)}
.logo>rect{fill:var(--logo-accent)}
.nav ul{list-style:none;padding:0;display:flex;gap:clamp(0.9rem, 0.5rem + 1.5vw, 2rem)}
.nav a{color:var(--c-muted);text-decoration:none;font-size:var(--fs-sm);font-weight:500}
.nav a:hover{color:var(--c-text)}

/* Hero */
.hero{padding-block:clamp(3.5rem, 2rem + 6vw, 7.5rem) clamp(4rem, 2.5rem + 6vw, 8rem)}
.hero .container{display:grid;gap:var(--space-7);align-items:center}
@media (min-width:64rem){.hero .container{grid-template-columns:minmax(0,1fr) minmax(0,1.12fr);gap:var(--space-8)}}
.hero h1{font-size:var(--fs-3xl);letter-spacing:-0.025em;max-width:15ch}
.hero .lead{margin-top:var(--space-5);font-size:var(--fs-lg);line-height:1.55;color:var(--c-muted);max-width:40ch}
.hero-actions{margin-top:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4);align-items:flex-start}
.meta{margin-top:var(--space-6);display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-4);padding:0;list-style:none;font-size:var(--fs-xs);color:var(--c-subtle);font-weight:500}
.meta li{display:inline-flex;align-items:center;gap:var(--space-2)}
.meta li+li::before{content:"";width:3px;height:3px;border-radius:50%;background:var(--c-border-strong);margin-right:var(--space-2)}

/* Command line */
.cmd{
  display:flex;align-items:center;gap:var(--space-3);width:100%;max-width:34rem;
  background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--radius-md);
  padding:0.4rem 0.4rem 0.4rem var(--space-4);min-width:0;
}
.cmd code{flex:1;min-width:0;overflow-x:auto;white-space:nowrap;font-size:var(--fs-code);padding-block:0.45rem;scrollbar-width:thin}
.cmd .prompt{color:var(--c-subtle);margin-right:0.6ch;user-select:none}
.copy{
  flex:none;font:inherit;font-size:var(--fs-xs);font-weight:600;cursor:pointer;
  border-radius:var(--radius-sm);padding:0.45rem 0.8rem;min-height:2.25rem;min-width:4.5rem;
  background:transparent;color:var(--c-accent);border:1px solid var(--c-border-strong);
}
.copy:hover{border-color:var(--c-accent);background:var(--c-accent-tint)}
.copy.primary{background:var(--c-accent);color:var(--c-on-accent);border-color:var(--c-accent)}
.copy.primary:hover{background:var(--c-accent-hover);border-color:var(--c-accent-hover)}
.btn-secondary{
  display:inline-flex;align-items:center;gap:var(--space-2);min-height:2.75rem;
  padding:0.55rem 1.1rem;border:1px solid var(--c-border-strong);border-radius:var(--radius-md);
  color:var(--c-text);text-decoration:none;font-weight:600;font-size:var(--fs-sm);
}
.btn-secondary:hover{color:var(--c-text);border-color:var(--c-text);text-decoration:none}

/* Code blocks */
.code{
  background:var(--c-code-bg);border:1px solid var(--c-border);border-radius:var(--radius-lg);
  overflow:hidden;min-width:0;
}
.code+.code{margin-top:var(--space-4)}
.code-bar{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:0.4rem 0.5rem 0.4rem var(--space-4);border-bottom:1px solid var(--c-border);background:var(--c-surface)}
.file{font-family:var(--font-mono);font-size:var(--fs-xs);font-weight:500;color:var(--c-muted);display:inline-flex;align-items:center;gap:var(--space-2)}
.file::before{content:"";width:8px;height:8px;border-radius:2px;background:var(--c-accent)}
.code-body{display:grid;grid-template-columns:auto minmax(0,1fr)}
.code-body pre{margin:0;padding:var(--space-4) 0;line-height:var(--lh-code)}
.gutter{padding-inline:var(--space-4) var(--space-3)!important;color:var(--c-subtle);text-align:right;user-select:none;border-right:1px solid var(--c-border)}
.src{overflow-x:auto;padding-inline:var(--space-4) var(--space-5)!important;color:var(--c-text);tab-size:4;scrollbar-width:thin}
.src:focus-visible{outline-offset:-2px}
.src .s{color:var(--c-accent)}
.src .v{font-weight:500}
.src .c{font-weight:500}
.src .d{color:var(--c-deny)}

/* Problem */
.problems{list-style:none;padding:0;display:grid;gap:var(--space-5) var(--space-7);counter-reset:p}
@media (min-width:48rem){.problems{grid-template-columns:repeat(2,minmax(0,1fr))}}
.problems li{counter-increment:p;padding-left:2.75rem;position:relative;max-width:var(--measure)}
.problems li::before{
  content:counter(p);position:absolute;left:0;top:0.1rem;width:1.75rem;height:1.75rem;
  border:1px solid var(--c-border-strong);border-radius:var(--radius-sm);
  display:grid;place-items:center;font-size:var(--fs-xs);font-weight:600;color:var(--c-muted);
}
.problems h3{font-size:var(--fs-base);font-weight:700;margin-bottom:var(--space-1)}
.problems p{color:var(--c-muted)}

/* Value points */
.feature{display:grid;gap:var(--space-6);align-items:center;padding-block:var(--space-6)}
.feature+.feature{border-top:1px dashed var(--c-border)}
@media (min-width:56rem){.feature{grid-template-columns:minmax(0,0.9fr) minmax(0,1.1fr);gap:var(--space-8)}}
.num{font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--c-accent);font-weight:500;display:block;margin-bottom:var(--space-2)}
.feature h3,.points h3,.step h3{font-size:var(--fs-xl);letter-spacing:-0.015em}
.feature p,.step p{margin-top:var(--space-3);color:var(--c-muted);max-width:52ch}
.diagram{background:var(--c-surface);border:1px solid var(--c-border);border-radius:var(--radius-lg);padding:var(--space-5)}
.diagram svg{display:block;width:100%;height:auto;font-family:var(--font-sans)}
.diagram figcaption{margin-top:var(--space-3);font-size:var(--fs-xs);color:var(--c-subtle)}
.d-box{fill:var(--c-bg);stroke:var(--c-border-strong);stroke-width:1.5}
.d-tenant{fill:none;stroke:var(--c-text);stroke-width:2}
.d-acc{fill:var(--c-accent-tint);stroke:var(--c-accent);stroke-width:2}
.d-deny{fill:var(--c-deny-tint);stroke:var(--c-deny);stroke-width:2}
.d-t{fill:var(--c-text);font-size:15px;font-weight:600}
.d-m{fill:var(--c-muted);font-size:13px;font-weight:500}
.d-a{fill:var(--c-accent);font-size:13px;font-weight:600}
.d-n{fill:var(--c-deny);font-size:15px;font-weight:700}
.d-y{fill:var(--c-accent);font-size:15px;font-weight:700}
.d-line{stroke:var(--c-subtle);stroke-width:1.5;fill:none}
.d-head{fill:var(--c-subtle)}
.d-mono{font-family:var(--font-mono);font-size:13px;font-weight:500;fill:var(--c-text)}

.points{list-style:none;padding:0;margin-top:var(--space-6);display:grid;gap:var(--space-6) var(--space-8);border-top:1px dashed var(--c-border);padding-top:var(--space-7)}
@media (min-width:48rem){.points{grid-template-columns:repeat(2,minmax(0,1fr))}}
.points h3{font-size:var(--fs-lg)}
.points p{margin-top:var(--space-2);color:var(--c-muted);max-width:52ch}

/* Code walk-through */
.step{display:grid;gap:var(--space-5);padding-block:var(--space-6);align-items:start}
.step+.step{border-top:1px dashed var(--c-border)}
@media (min-width:56rem){.step{grid-template-columns:minmax(0,0.8fr) minmax(0,1.2fr);gap:var(--space-8)}}
.note{margin-top:var(--space-4);font-size:var(--fs-sm);color:var(--c-muted);border-left:2px solid var(--c-accent);padding-left:var(--space-4);max-width:52ch}

/* Comparison */
.table-hint{font-size:var(--fs-xs);color:var(--c-subtle);margin-bottom:var(--space-3)}
@media (min-width:72rem){.table-hint{display:none}}
.table-wrap{overflow-x:auto;border:1px solid var(--c-border);border-radius:var(--radius-lg);scrollbar-width:thin}
.table-wrap:focus-visible{outline-offset:2px}
table{border-collapse:separate;border-spacing:0;width:100%;min-width:62rem;font-size:var(--fs-sm);line-height:1.5}
caption{text-align:left;padding:var(--space-4) var(--space-5);font-size:var(--fs-xs);color:var(--c-subtle);border-bottom:1px solid var(--c-border);caption-side:top}
th,td{padding:0.8rem 1rem;text-align:left;vertical-align:top;border-bottom:1px solid var(--c-border)}
tbody tr:last-child th,tbody tr:last-child td{border-bottom:0}
thead th{font-size:var(--fs-xs);font-weight:700;color:var(--c-text);background:var(--c-surface);white-space:nowrap}
th[scope="row"],thead th:first-child{
  position:sticky;left:0;z-index:1;background:var(--c-bg);font-weight:600;
  width:11rem;min-width:9rem;border-right:1px solid var(--c-border);
}
thead th:first-child{background:var(--c-surface);z-index:2}
td{color:var(--c-muted)}
.ours{background:var(--c-accent-tint);color:var(--c-text);font-weight:600}
thead th.ours{color:var(--c-accent);background:var(--c-accent-tint)}
.none{color:var(--c-subtle)}
td code{white-space:nowrap}
.reading{margin-top:var(--space-6);display:grid;gap:var(--space-3);max-width:var(--measure);padding:0;list-style:none}
.reading li{padding-left:var(--space-5);position:relative;color:var(--c-muted)}
.reading li::before{content:"";position:absolute;left:0;top:0.75em;width:0.6rem;height:1px;background:var(--c-border-strong)}
.reading strong{color:var(--c-text);font-weight:600}
.more{margin-top:var(--space-5);font-weight:600;font-size:var(--fs-sm)}

/* When not */
.not-list{list-style:none;padding:0;border:1px solid var(--c-border);border-radius:var(--radius-lg);max-width:52rem}
.not-list li{display:grid;gap:var(--space-1) var(--space-5);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--c-border)}
.not-list li:last-child{border-bottom:0}
@media (min-width:44rem){.not-list li{grid-template-columns:minmax(0,1fr) minmax(0,1.3fr)}}
.not-list .if{font-weight:600}
.not-list .then{color:var(--c-muted)}
.not-list .then::before{content:"→ ";color:var(--c-subtle)}
@media (min-width:44rem){.not-list .then::before{content:"→";margin-right:var(--space-3)}}
.not-list li.warn .if{color:var(--c-deny)}

/* Install steps */
.steps{list-style:none;padding:0;counter-reset:s;display:grid;gap:var(--space-5);max-width:48rem}
.steps li{counter-increment:s;display:grid;grid-template-columns:2rem minmax(0,1fr);gap:var(--space-4);align-items:start}
.steps li::before{content:counter(s);font-family:var(--font-mono);font-size:var(--fs-sm);color:var(--c-accent);font-weight:500;padding-top:0.7rem;text-align:right}
.steps .cmd{max-width:none}
.steps p{padding-top:0.6rem;color:var(--c-muted)}
.steps p strong{color:var(--c-text);font-weight:600}

/* FAQ */
.faq{display:grid;gap:0;border-top:1px solid var(--c-border)}
@media (min-width:56rem){.faq{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--space-8)}}
.faq div{padding-block:var(--space-5);border-bottom:1px solid var(--c-border)}
.faq dt{font-weight:700;font-size:var(--fs-base)}
.faq dd{margin-top:var(--space-2);color:var(--c-muted);max-width:56ch}

/* Final install */
.final{text-align:left}
.final-box{border:1px solid var(--c-border);border-radius:var(--radius-lg);background:var(--c-surface);padding:clamp(1.5rem, 1rem + 3vw, 3.5rem);display:grid;gap:var(--space-5)}
.final-box h2{font-size:var(--fs-2xl)}
.final-box .cmd{max-width:40rem;background:var(--c-bg)}
.final-links{display:flex;flex-wrap:wrap;gap:var(--space-3) var(--space-5);font-weight:600;font-size:var(--fs-sm)}
.caution{font-size:var(--fs-sm);color:var(--c-muted);max-width:var(--measure)}

/* Footer */
.site-footer{border-top:1px solid var(--c-border);padding-block:var(--space-7);font-size:var(--fs-sm);color:var(--c-muted)}
.site-footer .container{display:grid;gap:var(--space-6)}
@media (min-width:56rem){.site-footer .container{grid-template-columns:minmax(0,1fr) auto;align-items:start}}
.site-footer p+p{margin-top:var(--space-2)}
.foot-links{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:var(--space-2) var(--space-5)}
.foot-links a{color:var(--c-muted);text-decoration:none}
.foot-links a:hover{color:var(--c-text);text-decoration:underline}

@media (prefers-reduced-motion:no-preference){
  .copy,.btn-secondary,a{transition:color .15s ease, background-color .15s ease, border-color .15s ease}
}
/* Root fix (phone 390 px): grid children may shrink; header wraps. */
.hero .container>*{min-width:0}
.table-wrap{position:relative}
@media (max-width:40rem){.site-header .container{flex-wrap:wrap;padding-block:var(--space-3)}.nav ul{flex-wrap:wrap}}
</style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header">
  <div class="container">
    <a class="lockup" href="/" aria-label="Access Profiles, home">
      <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Access Profiles">
        <g fill="none" stroke="#1E293B" stroke-width="6" stroke-linecap="square">
          <rect x="8" y="8" width="48" height="48" rx="8"/>
          <line x1="32" y1="8" x2="32" y2="56"/>
          <line x1="8" y1="32" x2="56" y2="32"/>
        </g>
        <rect fill="#1F6F78" x="38" y="14" width="12" height="12" rx="2"/>
      </svg>
      <span>Access Profiles</span>
    </a>
    <nav class="nav" aria-label="Main">
      <ul>
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles#readme">Docs</a></li>
        <li><a href="#comparison">Comparison</a></li>
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles">GitHub</a></li>
      </ul>
    </nav>
  </div>
</header>

<main id="main">

  <!-- Hero -->
  <section class="hero" aria-labelledby="hero-title">
    <div class="container">
      <div>
        <p class="eyebrow">Laravel package · Open source</p>
        <h1 id="hero-title">Different permissions in different parts of a tenant.</h1>
        <p class="lead">Scoped access profiles for multi-tenant Laravel apps. Deny wins. Every grant records who gave it and why.</p>
        <div class="hero-actions">
          <div class="cmd">
            <code><span class="prompt" aria-hidden="true">$</span>composer require seisigmasrl/laravel-access-profiles</code>
            <button class="copy primary" type="button" data-copy="composer require seisigmasrl/laravel-access-profiles" aria-label="Copy install command"><span class="copy-label">Copy</span></button>
          </div>
          <a class="btn-secondary" href="https://github.com/seisigmasrl/laravel-access-profiles">View on GitHub</a>
        </div>
        <ul class="meta" aria-label="Package facts">
          <li>v0.1.0</li>
          <li>MIT</li>
          <li>PHP 8.3+</li>
          <li>Laravel 12.69+ or 13.30+</li>
        </ul>
      </div>

      <div class="code" role="group" aria-label="Example: grant.php">
        <div class="code-bar">
          <span class="file">grant.php</span>
          <button class="copy" type="button" data-copy-from="code-hero" aria-label="Copy grant.php"><span class="copy-label">Copy</span></button>
        </div>
        <div class="code-body">
<pre class="gutter" aria-hidden="true">1
2
3
4</pre>
<pre class="src" tabindex="0"><code id="code-hero"><span class="v">$assignment</span> = <span class="c">Access</span>::grant(<span class="s">'reviewer'</span>)-&gt;to(<span class="v">$user</span>)-&gt;in(<span class="v">$team</span>)
    -&gt;onlyScopes([<span class="v">$site</span>, <span class="v">$otherSite</span>])-&gt;titled(<span class="s">'Review cover'</span>)
    -&gt;validFrom(now())-&gt;validUntil(now()-&gt;addMonths(6))
    -&gt;by(<span class="v">$admin</span>)-&gt;because(<span class="s">'Cover leave'</span>)-&gt;save();</code></pre>
        </div>
      </div>
    </div>
  </section>

  <!-- The problem -->
  <section class="section" id="problem" aria-labelledby="problem-title">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">The problem</p>
        <h2 id="problem-title">One role per tenant is not enough.</h2>
        <p>In a multi-tenant app, the same person often needs different access in different parts of the same tenant.</p>
      </div>
      <ol class="problems">
        <li>
          <h3>Different roles in one tenant</h3>
          <p>A manager in two sites, read-only in a third. Same person, same tenant.</p>
        </li>
        <li>
          <h3>Access with an end date or a title</h3>
          <p>An external auditor until a date. Appointed access through a title such as “Board treasurer”.</p>
        </li>
        <li>
          <h3>A broad grant with one hole</h3>
          <p>Everything in billing, except approving payments.</p>
        </li>
        <li>
          <h3>A query, not a loop</h3>
          <p>“Who can approve payments in site 4?” must be a query, not a loop over every user.</p>
        </li>
        <li>
          <h3>A record of every grant</h3>
          <p>“Who gave this person access, and why?”</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- Value points -->
  <section class="section" id="features" aria-labelledby="features-title">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">What it does</p>
        <h2 id="features-title">Clear rules for who can do what, and where.</h2>
        <p>Tenants, scopes and holders are your own Eloquent models. A team can be a tenant, and its sites can be scopes. Each point below has a test in the repository.</p>
      </div>

      <div class="feature">
        <div>
          <span class="num">01</span>
          <h3>Access per scope set, not per tenant.</h3>
          <p>One assignment covers the whole tenant or a chosen list of scopes.</p>
        </div>
        <figure class="diagram">
          <svg viewBox="0 0 480 268" role="img" aria-labelledby="dg1-t dg1-d">
            <title id="dg1-t">Tenant, scopes and one assignment</title>
            <desc id="dg1-d">A team tenant contains four sites. One reviewer assignment covers site 1 and site 3. Sites 2 and 4 are not in the assignment.</desc>
            <text class="d-m" x="20" y="20">Tenant: team</text>
            <rect class="d-tenant" x="20" y="32" width="440" height="200" rx="12"/>
            <rect class="d-acc" x="36" y="48" width="196" height="76" rx="8"/>
            <text class="d-t" x="54" y="80">site 1</text>
            <text class="d-a" x="54" y="104">reviewer</text>
            <rect class="d-box" x="248" y="48" width="196" height="76" rx="8"/>
            <text class="d-t" x="266" y="80">site 2</text>
            <text class="d-m" x="266" y="104">not in this assignment</text>
            <rect class="d-acc" x="36" y="140" width="196" height="76" rx="8"/>
            <text class="d-t" x="54" y="172">site 3</text>
            <text class="d-a" x="54" y="196">reviewer</text>
            <rect class="d-box" x="248" y="140" width="196" height="76" rx="8"/>
            <text class="d-t" x="266" y="172">site 4</text>
            <text class="d-m" x="266" y="196">not in this assignment</text>
            <rect class="d-acc" x="20" y="248" width="12" height="12" rx="2"/>
            <text class="d-m" x="40" y="259">One assignment: reviewer, sites 1 and 3</text>
          </svg>
          <figcaption>A tenant is your model. Its scopes are your models too.</figcaption>
        </figure>
      </div>

      <div class="feature">
        <div>
          <span class="num">02</span>
          <h3>Deny wins. Default is no.</h3>
          <p>Any matching deny beats every allow, in any order. With no rule, the answer is false.</p>
        </div>
        <figure class="diagram">
          <svg viewBox="0 0 480 312" role="img" aria-labelledby="dg2-t dg2-d">
            <title id="dg2-t">How a check is decided</title>
            <desc id="dg2-d">First, if any matching deny exists, the answer is false. Next, if any matching allow exists, the answer is true. If there is no rule, the answer is false.</desc>
            <defs>
              <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path class="d-head" d="M0,0 L10,5 L0,10 z"/>
              </marker>
            </defs>
            <rect class="d-box" x="20" y="12" width="440" height="44" rx="8"/>
            <text class="d-mono" x="40" y="39">can('billing.invoice.approve', $site)</text>

            <path class="d-line" d="M150,56 V86" marker-end="url(#ah)"/>
            <rect class="d-box" x="20" y="90" width="260" height="44" rx="8"/>
            <text class="d-t" x="40" y="117">Any matching deny?</text>
            <path class="d-line" d="M280,112 H332" marker-end="url(#ah)"/>
            <text class="d-m" x="292" y="104">yes</text>
            <rect class="d-deny" x="336" y="90" width="124" height="44" rx="8"/>
            <text class="d-n" x="356" y="117">false</text>

            <path class="d-line" d="M150,134 V166" marker-end="url(#ah)"/>
            <text class="d-m" x="160" y="155">no</text>
            <rect class="d-box" x="20" y="170" width="260" height="44" rx="8"/>
            <text class="d-t" x="40" y="197">Any matching allow?</text>
            <path class="d-line" d="M280,192 H332" marker-end="url(#ah)"/>
            <text class="d-m" x="292" y="184">yes</text>
            <rect class="d-acc" x="336" y="170" width="124" height="44" rx="8"/>
            <text class="d-y" x="356" y="197">true</text>

            <path class="d-line" d="M150,214 V246" marker-end="url(#ah)"/>
            <text class="d-m" x="160" y="235">no rule</text>
            <rect class="d-deny" x="20" y="250" width="260" height="44" rx="8"/>
            <text class="d-n" x="40" y="277">false</text>
            <text class="d-m" x="92" y="277">denied by default</text>
          </svg>
          <figcaption>The order of the rules does not change the answer.</figcaption>
        </figure>
      </div>

      <ul class="points">
        <li>
          <span class="num">03</span>
          <h3>Access that ends on time, without a scheduler.</h3>
          <p>Start dates are inclusive. End dates are exclusive. The cache TTL stops at the next boundary.</p>
        </li>
        <li>
          <span class="num">04</span>
          <h3>Who, why, and when, on every grant.</h3>
          <p>Each assignment stores the grantor and the reason. Revoked rows stay as history. Write events fire after commit.</p>
        </li>
        <li>
          <span class="num">05</span>
          <h3>“Who can do X here?” is one query.</h3>
          <p><code>Access::holders()</code> applies deny, scope, validity and conditions. It returns a builder you can paginate.</p>
        </li>
        <li>
          <span class="num">06</span>
          <h3>Safe grants by default.</h3>
          <p>Guards reject self-assignment and escalation. Scopes must belong to the tenant. Rejections write nothing.</p>
        </li>
        <li>
          <span class="num">07</span>
          <h3>No global tenant state, no owner bypass.</h3>
          <p>Every check takes a target. It is safe with Octane and queued jobs. Owners get a full profile like anyone else.</p>
        </li>
        <li>
          <span class="num">08</span>
          <h3>Small footprint, tested docs.</h3>
          <p>PHP and 8 <code>illuminate/*</code> packages only. Every README example has a behaviour test.</p>
        </li>
      </ul>
    </div>
  </section>

  <!-- Code walk-through -->
  <section class="section" id="code" aria-labelledby="code-title">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Code walk-through</p>
        <h2 id="code-title">Define, grant, check, ask.</h2>
        <p>Four steps cover the whole flow. The examples use a team as the tenant and its sites as scopes.</p>
      </div>

      <div class="step">
        <div>
          <span class="num">Step 1</span>
          <h3>Define a profile.</h3>
          <p>A profile combines allow and deny rules in a tenant. This reviewer can do everything in billing, except approve invoices. The profile records who made it and why.</p>
        </div>
        <div class="code" role="group" aria-label="Example: profile.php">
          <div class="code-bar">
            <span class="file">profile.php</span>
            <button class="copy" type="button" data-copy-from="code-profile" aria-label="Copy profile.php"><span class="copy-label">Copy</span></button>
          </div>
          <div class="code-body">
<pre class="gutter" aria-hidden="true">1
2
3</pre>
<pre class="src" tabindex="0"><code id="code-profile"><span class="v">$profile</span> = <span class="c">Access</span>::profile(<span class="s">'reviewer'</span>)-&gt;in(<span class="v">$team</span>)
    -&gt;allow(<span class="s">'billing.*'</span>)-&gt;deny(<span class="d">'billing.invoice.approve'</span>)
    -&gt;by(<span class="v">$admin</span>)-&gt;because(<span class="s">'Keep approvals separate'</span>)-&gt;save();</code></pre>
          </div>
        </div>
      </div>

      <div class="step">
        <div>
          <span class="num">Step 2</span>
          <h3>Grant it to a holder.</h3>
          <p>An assignment gives the profile to a holder in the tenant. This one covers two sites and has a title. It starts now and ends in six months. It records the grantor and the reason.</p>
        </div>
        <div class="code" role="group" aria-label="Example: grant.php">
          <div class="code-bar">
            <span class="file">grant.php</span>
            <button class="copy" type="button" data-copy-from="code-grant" aria-label="Copy grant.php"><span class="copy-label">Copy</span></button>
          </div>
          <div class="code-body">
<pre class="gutter" aria-hidden="true">1
2
3
4</pre>
<pre class="src" tabindex="0"><code id="code-grant"><span class="v">$assignment</span> = <span class="c">Access</span>::grant(<span class="s">'reviewer'</span>)-&gt;to(<span class="v">$user</span>)-&gt;in(<span class="v">$team</span>)
    -&gt;onlyScopes([<span class="v">$site</span>, <span class="v">$otherSite</span>])-&gt;titled(<span class="s">'Review cover'</span>)
    -&gt;validFrom(now())-&gt;validUntil(now()-&gt;addMonths(6))
    -&gt;by(<span class="v">$admin</span>)-&gt;because(<span class="s">'Cover leave'</span>)-&gt;save();</code></pre>
          </div>
        </div>
      </div>

      <div class="step">
        <div>
          <span class="num">Step 3</span>
          <h3>Check access.</h3>
          <p>Every check takes a target. <code>can()</code> and <code>canAccess()</code> give the same answer. <code>explain()</code> returns the decision. In Blade, use <code>@canAccess</code>.</p>
          <p class="note">It works next to Laravel's Gate, not instead of it. <code>$user-&gt;can()</code> and Gate keep their normal behaviour. Your policies call <code>canAccess()</code>.</p>
        </div>
        <div>
          <div class="code" role="group" aria-label="Example: check.php">
            <div class="code-bar">
              <span class="file">check.php</span>
              <button class="copy" type="button" data-copy-from="code-check" aria-label="Copy check.php"><span class="copy-label">Copy</span></button>
            </div>
            <div class="code-body">
<pre class="gutter" aria-hidden="true">1
2
3</pre>
<pre class="src" tabindex="0"><code id="code-check"><span class="v">$allowed</span> = <span class="c">Access</span>::for(<span class="v">$user</span>)-&gt;can(<span class="s">'billing.invoice.view'</span>, <span class="v">$site</span>);
<span class="v">$sameAnswer</span> = <span class="v">$user</span>-&gt;canAccess(<span class="s">'billing.invoice.view'</span>, <span class="v">$site</span>);
<span class="v">$decision</span> = <span class="c">Access</span>::for(<span class="v">$user</span>)-&gt;explain(<span class="s">'billing.invoice.approve'</span>, <span class="v">$site</span>);</code></pre>
            </div>
          </div>
          <div class="code" role="group" aria-label="Example: Blade">
            <div class="code-bar">
              <span class="file">Blade</span>
              <button class="copy" type="button" data-copy-from="code-blade" aria-label="Copy Blade example"><span class="copy-label">Copy</span></button>
            </div>
            <div class="code-body">
<pre class="gutter" aria-hidden="true">1
2
3</pre>
<pre class="src" tabindex="0"><code id="code-blade"><span class="v">@canAccess</span>(<span class="s">'billing.invoice.view'</span>, <span class="v">$site</span>)
View invoices
<span class="v">@endcanAccess</span></code></pre>
            </div>
          </div>
        </div>
      </div>

      <div class="step">
        <div>
          <span class="num">Step 4</span>
          <h3>Ask who has access.</h3>
          <p><code>Access::holders()</code> answers “who can do this here?” with one query. It applies deny, scope, validity and conditions. <code>holdersQuery()</code> lets you count. <code>history()</code> shows the grants of a holder in a tenant, including revoked rows.</p>
        </div>
        <div class="code" role="group" aria-label="Example: query.php">
          <div class="code-bar">
            <span class="file">query.php</span>
            <button class="copy" type="button" data-copy-from="code-query" aria-label="Copy query.php"><span class="copy-label">Copy</span></button>
          </div>
          <div class="code-body">
<pre class="gutter" aria-hidden="true">1
2
3</pre>
<pre class="src" tabindex="0"><code id="code-query"><span class="v">$holders</span> = <span class="c">Access</span>::holders(<span class="s">'billing.invoice.view'</span>, <span class="v">$site</span>);
<span class="v">$count</span> = <span class="c">Access</span>::holdersQuery(<span class="s">'billing.invoice.view'</span>, <span class="v">$site</span>)-&gt;count();
<span class="v">$history</span> = <span class="c">Access</span>::history(<span class="v">$user</span>, <span class="v">$team</span>);</code></pre>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Comparison -->
  <section class="section" id="comparison" aria-labelledby="comparison-title">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Comparison</p>
        <h2 id="comparison-title">How it compares.</h2>
        <p>Each option fits a different case. The table shows what each one does out of the box.</p>
      </div>

      <p class="table-hint" aria-hidden="true">Scroll the table sideways to see all columns.</p>
      <div class="table-wrap" role="region" aria-labelledby="comparison-title" tabindex="0">
        <table>
          <caption>Checked on 2026-10-28. Versions: access-profiles 0.1.0, spatie/laravel-permission 8.3.2, silber/bouncer v1.0.4, santigarcor/laratrust 8.5.6, Laravel 13.x Gate. “—” means no.</caption>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col" class="ours">Access Profiles</th>
              <th scope="col">spatie/laravel-permission</th>
              <th scope="col">Bouncer</th>
              <th scope="col">Laratrust</th>
              <th scope="col">Gate + policies</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Multi-tenant scope</th>
              <td class="ours">Tenant + scopes inside it</td>
              <td>One team dimension</td>
              <td>One tenant id per request</td>
              <td>One team, passed per call</td>
              <td>You write it</td>
            </tr>
            <tr>
              <th scope="row">One assignment → a set of scopes</th>
              <td class="ours">Yes</td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td>You write it</td>
            </tr>
            <tr>
              <th scope="row">Deny</th>
              <td class="ours">Yes, deny wins</td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td>Yes, <code>forbid()</code></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td>You write it</td>
            </tr>
            <tr>
              <th scope="row">Validity window</th>
              <td class="ours"><code>valid_from</code> / <code>valid_until</code></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td>You write it</td>
            </tr>
            <tr>
              <th scope="row">Grantor + reason audit</th>
              <td class="ours">Yes, plus write events</td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">No</span></td>
              <td>You write it</td>
            </tr>
            <tr>
              <th scope="row">“Who can do X here?”</th>
              <td class="ours"><code>Access::holders()</code></td>
              <td><code>User::permission()</code> for the current team</td>
              <td>By role only</td>
              <td><code>whereHasPermission()</code></td>
              <td>Loop over users</td>
            </tr>
            <tr>
              <th scope="row">Global tenant state</th>
              <td class="ours">None; target per check</td>
              <td>Global team id</td>
              <td>Static scope</td>
              <td>None</td>
              <td>None</td>
            </tr>
            <tr>
              <th scope="row">Owner / super-admin</th>
              <td class="ours">No bypass</td>
              <td><code>Gate::before</code></td>
              <td><code>everything()</code></td>
              <td>Role check</td>
              <td><code>Gate::before</code></td>
            </tr>
            <tr>
              <th scope="row">Laravel versions</th>
              <td class="ours">12.69+, 13.30+</td>
              <td>12, 13</td>
              <td>11, 12, 13</td>
              <td>10, 11, 12, 13</td>
              <td class="none"><span aria-hidden="true">—</span><span class="sr-only">Not applicable</span></td>
            </tr>
            <tr>
              <th scope="row">Maintenance</th>
              <td class="ours">New: 0.1.0 (2026-10-28)</td>
              <td>Active</td>
              <td>Slow (about one release a year)</td>
              <td>Active</td>
              <td>Laravel core</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul class="reading" aria-label="Honest reading">
        <li><strong>spatie/laravel-permission</strong> is the safe default for one tenant or one team level, with the biggest community.</li>
        <li><strong>Bouncer</strong> is the closest in spirit. It has deny.</li>
        <li><strong>Laratrust</strong> passes the team explicitly.</li>
        <li><strong>Plain Gate + policies</strong> is enough when roles are few and fixed.</li>
      </ul>
      <p class="more"><a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md">Full comparison with sources</a></p>
    </div>
  </section>

  <!-- When not to use it -->
  <section class="section" id="when-not" aria-labelledby="when-not-title">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">When not to use it</p>
        <h2 id="when-not-title">It is not the right tool for every app.</h2>
      </div>
      <ul class="not-list">
        <li><span class="if">One tenant or one flat team level</span><span class="then">consider spatie/laravel-permission.</span></li>
        <li><span class="if">A few fixed roles</span><span class="then">Laravel's Gates and policies may be enough.</span></li>
        <li><span class="if">Record-level rules</span><span class="then">keep them in a policy.</span></li>
        <li><span class="if">An admin UI out of the box</span><span class="then">build your own screens.</span></li>
        <li class="warn"><span class="if">A mature, proven package today</span><span class="then">this package is new. Review it before relying on it for access control.</span></li>
      </ul>
    </div>
  </section>

  <!-- Install steps -->
  <section class="section" id="install" aria-labelledby="install-title">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">Install</p>
        <h2 id="install-title">Install in six steps.</h2>
        <p>Requires PHP 8.3+ and Laravel 12.69+ or 13.30+.</p>
      </div>
      <ol class="steps">
        <li>
          <div class="cmd">
            <code><span class="prompt" aria-hidden="true">$</span>composer require seisigmasrl/laravel-access-profiles</code>
            <button class="copy" type="button" data-copy="composer require seisigmasrl/laravel-access-profiles" aria-label="Copy step 1 command"><span class="copy-label">Copy</span></button>
          </div>
        </li>
        <li>
          <div class="cmd">
            <code><span class="prompt" aria-hidden="true">$</span>php artisan vendor:publish --tag=access-profiles-config</code>
            <button class="copy" type="button" data-copy="php artisan vendor:publish --tag=access-profiles-config" aria-label="Copy step 2 command"><span class="copy-label">Copy</span></button>
          </div>
        </li>
        <li>
          <div class="cmd">
            <code><span class="prompt" aria-hidden="true">$</span>php artisan vendor:publish --tag=access-profiles-migrations</code>
            <button class="copy" type="button" data-copy="php artisan vendor:publish --tag=access-profiles-migrations" aria-label="Copy step 3 command"><span class="copy-label">Copy</span></button>
          </div>
        </li>
        <li>
          <p><strong>Configure the permission catalogue and templates.</strong> Choose table names before migrating.</p>
        </li>
        <li>
          <div class="cmd">
            <code><span class="prompt" aria-hidden="true">$</span>php artisan migrate</code>
            <button class="copy" type="button" data-copy="php artisan migrate" aria-label="Copy step 5 command"><span class="copy-label">Copy</span></button>
          </div>
        </li>
        <li>
          <div class="cmd">
            <code><span class="prompt" aria-hidden="true">$</span>php artisan access-profiles:sync-templates</code>
            <button class="copy" type="button" data-copy="php artisan access-profiles:sync-templates" aria-label="Copy step 6 command"><span class="copy-label">Copy</span></button>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <!-- FAQ -->
  <section class="section" id="faq" aria-labelledby="faq-title">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow">FAQ</p>
        <h2 id="faq-title">Questions and answers.</h2>
      </div>
      <dl class="faq">
        <div>
          <dt>Does it replace Laravel's Gate?</dt>
          <dd>No. Gate and <code>$user-&gt;can()</code> keep their normal behaviour. Call <code>canAccess()</code> or <code>Access::for()</code> from a policy.</dd>
        </div>
        <div>
          <dt>Is there a super-admin or owner bypass?</dt>
          <dd>No. An owner gets a full profile like everyone else.</dd>
        </div>
        <div>
          <dt>Is it safe with Octane and queues?</dt>
          <dd>There is no global tenant state. Every check takes a target. Jobs re-check when they run.</dd>
        </div>
        <div>
          <dt>Do I need a scheduler for expiry?</dt>
          <dd>No. The cache stops at the next validity boundary.</dd>
        </div>
        <div>
          <dt>Does it ship an admin UI?</dt>
          <dd>No. Build your own screens.</dd>
        </div>
        <div>
          <dt>Does it work with Sanctum tokens?</dt>
          <dd>Optional. With <code>token_intersection</code>, a token can only narrow access. There is no Sanctum dependency.</dd>
        </div>
        <div>
          <dt>Can I move from another permission package?</dt>
          <dd>Yes. Write a <code>BackfillSource</code> and run <code>access-profiles:backfill --dry-run</code> first.</dd>
        </div>
      </dl>
    </div>
  </section>

  <!-- Final install -->
  <section class="section final" aria-labelledby="final-title">
    <div class="container">
      <div class="final-box">
        <h2 id="final-title">Start with one command.</h2>
        <div class="cmd">
          <code><span class="prompt" aria-hidden="true">$</span>composer require seisigmasrl/laravel-access-profiles</code>
          <button class="copy primary" type="button" data-copy="composer require seisigmasrl/laravel-access-profiles" aria-label="Copy install command"><span class="copy-label">Copy</span></button>
        </div>
        <p class="caution">Version 0.1.0 is new. Review it before relying on it for access control.</p>
        <p class="final-links">
          <a href="https://github.com/seisigmasrl/laravel-access-profiles#readme">Read the docs</a>
          <a href="https://github.com/seisigmasrl/laravel-access-profiles">View on GitHub</a>
          <a href="https://packagist.org/packages/seisigmasrl/laravel-access-profiles">Packagist</a>
        </p>
      </div>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="container">
    <div>
      <a class="lockup" href="/" aria-label="Access Profiles, home">
        <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Access Profiles">
          <g fill="none" stroke="#1E293B" stroke-width="6" stroke-linecap="square">
            <rect x="8" y="8" width="48" height="48" rx="8"/>
            <line x1="32" y1="8" x2="32" y2="56"/>
            <line x1="8" y1="32" x2="56" y2="32"/>
          </g>
          <rect fill="#1F6F78" x="38" y="14" width="12" height="12" rx="2"/>
        </svg>
        <span>Access Profiles</span>
      </a>
      <p style="margin-top:var(--space-4)">Version 0.1.0, released 2026-10-28. MIT license.</p>
      <p>By Ricardo A. Vargas R. (Seisigma SRL).</p>
    </div>
    <nav aria-label="Footer">
      <ul class="foot-links">
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles">GitHub</a></li>
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles#readme">Docs</a></li>
        <li><a href="https://packagist.org/packages/seisigmasrl/laravel-access-profiles">Packagist</a></li>
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/DESIGN.md">Design notes</a></li>
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/CHANGELOG.md">Changelog</a></li>
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/SECURITY.md">Security</a></li>
        <li><a href="https://github.com/seisigmasrl/laravel-access-profiles/blob/main/LICENSE.md">License (MIT)</a></li>
        <li><a href="/privacy">Privacy</a></li>
      </ul>
    </nav>
  </div>
</footer>

<p id="copy-status" class="sr-only" aria-live="polite"></p>

<script>
(function () {
  var live = document.getElementById('copy-status');
  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }
  document.querySelectorAll('button[data-copy], button[data-copy-from]').forEach(function (btn) {
    var label = btn.querySelector('.copy-label');
    var timer;
    btn.addEventListener('click', function () {
      var text = btn.hasAttribute('data-copy')
        ? btn.getAttribute('data-copy')
        : document.getElementById(btn.getAttribute('data-copy-from')).textContent;
      function done(ok) {
        label.textContent = ok ? 'Copied' : 'Select to copy';
        live.textContent = ok ? 'Copied to clipboard.' : 'Copy failed. Select the text and copy it.';
        clearTimeout(timer);
        timer = setTimeout(function () { label.textContent = 'Copy'; live.textContent = ''; }, 2000);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });
})();
</script>
</body>
</html>

```


## Output rules
- Answer with ONE complete HTML file and nothing else: start with <!doctype html>, end with </html>.
- Self-contained: inline CSS, no external JS. Google Fonts links are allowed.
- It must work at 390px and 1440px wide. No text may run off the screen at 390px.
- Keep the design tokens as CSS custom properties on :root. Light first; dark via prefers-color-scheme.
- Add a short HTML comment at the top: direction name + "v2", and one line per revision note on what you changed.
- Use only facts from the pack. No invented numbers, output lines, logos or testimonials.
