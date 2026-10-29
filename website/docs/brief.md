# laravel-access-profiles website brief
Status: draft (2026-10-28). Waiting for Ricardo to confirm.

Every fact has a tag: `confirmed` (Ricardo said it) or `assumed` (my default), and a source.
Source short names: **README** = `README.md`, **DESIGN** = `docs/DESIGN.md`, **COMP** = `docs/COMPARISON.md`,
**CL** = `CHANGELOG.md`, **CJ** = `composer.json`, **SEC** = `SECURITY.md`, test files = `tests/...`.
Rule: the site says nothing that these files do not prove.

## Product
- Name: Laravel Access Profiles. Composer package `seisigmasrl/laravel-access-profiles`, namespace `Seisigma\AccessProfiles`. (CJ; DESIGN §8)
- What it does: gives people different permissions in different parts of a tenant. Profiles combine allow and deny rules. Assignments cover a whole tenant or selected scopes, with validity dates and a record of who granted access and why. Any matching deny wins. Access is denied by default. (README intro)
- Status: 0.1.0, **unreleased**. (README first line; CL "0.1.0 - unreleased")
- Requires PHP 8.3+ and Laravel 12.69+ or 13.30+. CI runs PHP 8.3, 8.4, 8.5 on each. (README "Supported versions"; CJ `require`)
- Runtime dependencies: PHP and `illuminate/*` only. (README intro; CJ `require`; `tests/ArchTest.php` "it only depends on php and illuminate at runtime")
- License MIT. (CJ `license`; `LICENSE.md`)
- Author: Ricardo A. Vargas R. (Seisigma SRL). (README "Credits and license")

## Goal
- Main action (`confirmed`): copy and run `composer require seisigmasrl/laravel-access-profiles`. (README "Install" step 1)
- Second action (`confirmed`): open the GitHub repo.
- Site job (`assumed`): in under one minute a developer knows (1) what problem it solves, (2) whether it fits their app, (3) how to install it. Honest fit beats a hard sell.

## Audience
- `assumed` (Ricardo's default, marked as an assumption): Laravel developers and tech leads who build multi-tenant SaaS apps.
- `assumed`: English only. Desktop first (developers read code on a desktop), but the page must work at 390 px.
- `assumed`: they already know `spatie/laravel-permission` or Gates and policies. They come to compare.

## Page sections (one landing page)
| # | Section | Purpose | Content source | Content status |
|---|---|---|---|---|
| 1 | Hero | Say what it is in one line. Show the install command with a copy button. Primary CTA = install, secondary = GitHub. Code snippet as the hero visual. | README intro + "Install"; `docs/description.md` tagline | Draft in `description.md` |
| 2 | The problem | Show the shape: tenant → scopes, one person with different powers per scope, temporary access, "one hole" in a broad grant, "who can do X here?", "who gave this access and why?" | DESIGN §1 | Ready (rewrite generic) |
| 3 | Why / value points | 6–8 points with proof (one test each). | `website/PRODUCT.md` "Value points" | Ready |
| 4 | Code example | One short flow: grant to a scope set with dates → check → deny wins → "who can?" query. Every line copied from README examples. | README "Profiles and assignments", "Checks and views", "Query access and history"; `tests/Docs/ReadmeExamplesTest.php` | Ready |
| 5 | Comparison | vs `spatie/laravel-permission`, `silber/bouncer`, `santigarcor/laratrust`, Laravel Gate + policies. Fair: keep their strengths, link each cell to its source, show the "checked on" date and versions. | COMP feature table + "Reading the table honestly" | Ready, see D3 (our column is stale) |
| 6 | When NOT to use it | Copy the README list as is. This builds trust. | README "When NOT to use this package"; COMP "Reading the table honestly" | Ready |
| 7 | Install steps | The six README steps, each with a copy button. | README "Install" | Ready |
| 8 | FAQ | 5–7 short answers (list below). | README, DESIGN §2.3, §3.3, §5.4 | Draft below |
| 9 | Final CTA | Install command again + GitHub. | README "Install" | Ready |
| 10 | Footer | Repo, Packagist, license MIT, SECURITY.md, privacy, author. | CJ, SEC, README "Credits" | Ready |

Other pages: **404** and **privacy**. (website-kit must-haves)

### Comparison rows to show (all from COMP; our column from README/CJ, see D3)
Multi-tenant scope · One assignment → a set of scopes · Deny · Validity window · Grantor + reason audit · "Who can do X here?" · Octane / queue global state · API tokens · Owner / super-admin · Laravel versions · Maintenance.
Keep the "Checked on 2026-10-28" line and exact versions (SP 8.3.2, BO v1.0.4, LT 8.5.6, Laravel 13.x).
Keep the honest reading: Spatie is the safe default for one tenant or one team level; Bouncer is the closest in spirit (it has deny); Laratrust passes the team explicitly; plain Gate is enough when roles are few and fixed.

### FAQ drafts (each with its source)
1. **Does it replace Laravel's Gate?** No. `$user->can()` and Gate keep their normal behaviour. You call `canAccess()` or `Access::for()` from a policy. (README "Checks and views"; `tests/Concerns/HasAccessProfilesTest.php` "keeps Laravel Gate independent of access profiles")
2. **Is there a super-admin or owner bypass?** No. An owner gets a full profile like everyone else. (README intro; DESIGN §2.1)
3. **Is it safe with Octane and queues?** There is no global tenant state. Every check takes a target. The request memo is a scoped binding. Jobs re-check when they run. (DESIGN §2.3; `tests/Resolver/MemoAndCacheTest.php` "flushes the memo between two octane-style requests"; `tests/Docs/ReadmeExamplesTest.php` "rechecks serialized queued job access at execution time")
4. **Do I need a scheduler for expiry?** No. Start dates are inclusive, end dates exclusive; the cache TTL stops at the next boundary. (README "Profiles and assignments"; DESIGN §2.2; `tests/Resolver/DecisionRulesTest.php` "becomes false when valid_until passes without any write")
5. **Does it ship an admin UI?** No. Build your own screens. (README "When NOT to use"; DESIGN §5.4)
6. **Does it work with Sanctum tokens?** Optional. With `token_intersection`, a real token can only narrow access. No Sanctum dependency. (README "Checks and views"; DESIGN §3.5; `tests/Resolver/TokenIntersectionTest.php` "never widens access through the token")
7. **Can I move from another permission package?** Yes, with a `BackfillSource` and `access-profiles:backfill --dry-run` first. (README "Commands"; `tests/Commands/CommandsTest.php`)

## Brand inputs
- Logo: none (`confirmed` in plan WEB.Q6 as open; default = wordmark, see D2).
- Colors, fonts: none exist (`assumed`). Decided in phase 4.
- Feel (`confirmed`): safe, precise, calm.
- Light + dark, follows the visitor's system (`confirmed`).
- Likes / dislikes: see `website/docs/taste.md`.
- Words never used on the site (`confirmed`): words from any one host app's domain (list in the private plan). The package is generic.

## Proof
- No stars, downloads or testimonials yet: the package is unreleased (README). Do not invent social proof. (`confirmed` by source rule)
- Proof we have: behaviour tests. Every README example has a test (README "Testing"; `tests/Docs/ReadmeExamplesTest.php`). CI matrix (README "Supported versions"). Static analysis and format gates (CJ `scripts`: `analyse`, `format`).

## Contact and forms
- No form. (`assumed`) Questions go to GitHub; security reports go to the email in SECURITY.md.

## Legal
- Privacy page: no cookies, cookie-free analytics, no form data. (`assumed`)
- License MIT link. (CJ)

## Domain, hosting, analytics
- Site lives in `website/` of this repo. `/website export-ignore` keeps it out of the Composer download. (`confirmed`)
- Host: Cloudflare Pages, at the final domain `laravel-access-profiles.packages.seisigma.co`. (`confirmed`)
- Build: root `website/`, command `npm run build`, output `dist`. (plan)
- Analytics: Cloudflare Web Analytics, cookie-free. (`assumed`)
- SEO must-haves: title + meta description, Open Graph + Twitter image (the 1280×640 banner), canonical URL, `sitemap.xml`, `robots.txt`, `lang="en"`, JSON-LD `SoftwareSourceCode` (`assumed`; `SoftwareApplication` is the other choice).

## Links (exact)
- Repo: https://github.com/seisigmasrl/laravel-access-profiles (CJ `homepage`)
- Packagist: https://packagist.org/packages/seisigmasrl/laravel-access-profiles (brief; live only after release, see D1)
- License: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/LICENSE.md
- Security: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/SECURITY.md
- Design notes: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/DESIGN.md
- Comparison: https://github.com/seisigmasrl/laravel-access-profiles/blob/main/docs/COMPARISON.md

## Dates
- None fixed. (`assumed`) Launch after the package's first release (D1).

## Approvals
- Design: Ricardo. Go-live: Ricardo (he runs the Cloudflare login and the production deploy). (`confirmed`, plan rules)

## Open decisions
| Code | Decision | Options | Recommendation | Owner |
|---|---|---|---|---|
| D1 | The package is unreleased; `composer require` fails until Packagist has it. | A) Launch the site after the 0.1.0 tag + Packagist submit. B) Launch now with a "pre-release" badge. | **A** — the primary CTA must work as written. | Ricardo |
| D2 | Logo | A) Wordmark only. B) Run `logo-designer`. | **A** for launch. | Ricardo |
| D3 | COMPARISON.md's own column is stale: "design only", Laravel "11, 12, 13", runtime deps `illuminate/{contracts,database,support}`. README and composer.json say 0.1.0, Laravel 12.69+/13.30+, eight `illuminate/*` packages. | A) Fix COMPARISON.md in the package first; the site copies it. B) The site uses README/composer values only for our column. | **A** — one source of truth. | Ricardo |
| D4 | JSON-LD type | A) `SoftwareSourceCode`. B) `SoftwareApplication`. | **A** — it is a code library. | Root |
