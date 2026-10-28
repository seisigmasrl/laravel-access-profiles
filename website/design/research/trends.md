# Trends — developer-tool and package landing pages (2026-10-28)

Method: 3 web searches (design-studio §3 limit) + 5 pages fetched on 2026-10-28.
Searches: "developer tool landing page design patterns 2026"; "open source library landing page best practices code example hero install command"; "Laravel package website landing page examples".
Limit: the fetch tool returned text, not CSS, so fonts and dark-mode behaviour of the sites are not recorded here.

## Sites looked at
| Site | Hero | Notes |
|---|---|---|
| https://pestphp.com | "The elegant testing framework for PHP developers and AI agents." CTAs "Start testing" / "Source code". | File-labelled code + terminal transcripts; install line with copy label near the end; stats and testimonials. |
| https://inertiajs.com | "Build frontend experiences with the backend you love". CTAs "Learn more" / "Read docs". | Code with line numbers in the hero; framework switcher (vue/tsx/svelte); feature grid. |
| https://livewire.laravel.com | "Build apps faster". CTAs "Read the pitch" / "Explore the docs". | Code beside a live preview; final CTA with `composer require livewire/livewire`. |
| https://filamentphp.com | "Build Laravel apps & admin panels fast" (title). CTAs "Get started" / "Join Discord". | Product screenshot, stats wall, sponsors, testimonials. |
| https://spatie.be/docs/laravel-permission/v6/introduction | "Laravel Permission — Associate users with roles and permissions". | Docs page, not a landing page; sidebar + plain code blocks. |

## 5 patterns to use
1. **Code snippet as the hero visual.** For libraries and SDKs the hero visual is a code snippet. We show a real README example.
   Source: https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025 (hero visual by product type).
2. **Two hero CTAs, visually different, with specific labels.** Primary = the install command (copy), secondary = "View on GitHub". Avoid a generic "Get started".
   Source: same Evil Martians study (hero CTAs); https://pestphp.com ("Start testing" / "Source code").
3. **Problem-led feature story, not a list of functions.** For early products, tell the problem first (DESIGN §1 shape), then the feature that solves it.
   Source: same Evil Martians study (feature storytelling: a list of functions is "the most straightforward—and weakest").
4. **File-labelled code blocks with a copy button on every command.** Label each block (`Permission.php`, `terminal`). The install command must run exactly as written.
   Source: https://pestphp.com (file-labelled samples, copy label); https://inertiajs.com (line numbers); https://tessl.io/registry/skills/github/lobehub/lobe-icons/building-landing-home (copyable install banner with license note).
5. **One closing CTA block + a short FAQ; a comparison table only for a switching pitch.** Our audience comes from Spatie/Bouncer/Laratrust, so the table earns its place. End with one full-width install block.
   Source: same Evil Martians study (supporting blocks: "You probably only need an FAQ"; comparison tables for switching pitches; final CTA with a single goal); https://livewire.laravel.com (closing `composer require` block).

## 3 patterns to avoid
1. **Fake or thin social proof** (logo walls, star counters, testimonial carousels) before the package has users. We have none; an empty wall reads as unsafe.
   Source: https://filamentphp.com and https://pestphp.com use stats because they have them; the Evil Martians study says even one real sentence is enough — so use none until there is one.
2. **Flashy motion, glassmorphism, bento grids for their own sake.** Heavy visuals fight "calm" and the speed budget; 2026 trend lists report a move to lighter visuals.
   Source: https://www.zoho.com/landingpage/landing-page-design-trends.html (shift away from autoplay video and heavy animation); Evil Martians study ("the flashy stuff comes later").
3. **Bold slogans and salesy words.** A bold slogan suits only established products; "No salesy BS" was one of the two rules on nearly every page studied.
   Source: same Evil Martians study.
