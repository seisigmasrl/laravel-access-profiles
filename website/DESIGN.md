# DESIGN.md — Access Profiles site

Source of truth for the build. Approved direction: **B "Scope Map"** by GPT-6 Astra, round 3
(`design/options/astra-v3/mock.html` = `design/mock.html`). Round 2 was approved by the owner on 2026-10-29
("v2 OK"); round 3 adds motion only, and `motion-check.mjs` passed on it.

Rule: keep the design as the model made it. Change only what the owner asks or what a check finds.

## 1. Feel

Safe, precise, calm (`docs/taste.md`). Code is the hero. Facts over adjectives. Few colours, much air, strong type.
The one picture is the scope map: holder → assignment → scopes inside a tenant, with one denied cell.

## 2. Colour tokens

Light is the default. Dark follows `prefers-color-scheme` (WEB.Q3). On the docs site Starlight also lets the
visitor pick; the same values apply.

| Token | Light | Dark | Why |
|---|---|---|---|
| `--bg` | `#FAFBFC` | `#101820` | Near-white / near-black. Calm, not pure, so code panels stand out. |
| `--surface` | `#FFFFFF` | `#16212C` | Cards, code panels, table cells. |
| `--soft` | `#F0F4F5` | `#1D2B38` | Code bars, table heads, neutral scope cells. |
| `--ink` | `#1E293B` | `#E2E8F0` | Brand slate from the logo. Body text. |
| `--muted` | `#526173` | `#ABBAC8` | Secondary text. AA on `--bg` and `--surface` in both themes. |
| `--accent` | `#1F6F78` | `#4FB3BD` | Brand teal from the logo. Links, granted scopes, primary button. |
| `--accent-soft` | `#E8F3F3` | `#17363E` | Granted cells, install box, closing band. |
| `--deny` | `#9F3547` | `#F0A1AF` | Only for deny / negative states (the denied cell, "when not to use" markers). |
| `--deny-soft` | `#FBEFF1` | `#3D2530` | Fill of the denied cell. |
| `--line` | `#CDD6DE` | `#3D5061` | Hairlines between sections and rows. |
| `--focus` | `#1F6F78` | `#4FB3BD` | 3 px focus ring, 5 px offset. |

Never Laravel red as an accent. Never the Laravel logo.

## 3. Type

- **Manrope** (400–800) for text and headings. It matches the logo lockup (Manrope 600).
- **JetBrains Mono** (400, 500) for code, commands, line numbers and step numbers.
- Two families only. Self-hosted in the build (`@fontsource`), `font-display: swap`.

| Token | Value | Use |
|---|---|---|
| `--text-xs` | `.8rem` | Labels, captions, table cells, code bar |
| `--text-sm` / `--text-base` | `1rem` | Body |
| `--text-lg` | `1.25rem` | Lead, value titles |
| `--text-xl` | `clamp(1.5625rem, 2.4vw, 1.95rem)` | h3 |
| `--text-h2` | `clamp(2rem, 3.6vw, 3rem)` | h2 |
| `--text-h1` | `clamp(2.5rem, 4.8vw, 4.5rem)` | h1 |

Steps are at least 1.25× apart (round 2 change). Headings: weight 700, tight negative tracking, `text-wrap: balance`.
Body line height 1.7. Text width at most 70ch.

## 4. Space, radius, layout

- Space scale: `.25 .5 .75 1 1.5 2 3 4 6 8 rem` (`--space-1` … `--space-10`).
- Radius: `--radius-sm .375rem`, `--radius-md .75rem`, `--radius-lg 1.25rem`.
- Content width `1200px`; side gutter 32 px (desktop) and 20 px (≤ 700 px).
- Sections are separated by a 1 px `--line` rule and `--space-9` padding (56 px on phones).
- Breakpoints: 1050 px (hero stacks), 700 px (phone layout, scope map turns vertical).

## 5. Components

| Component | Rule |
|---|---|
| Install command | Accent border on `--accent-soft`, mono text, a Copy button (min 44 px high). Primary action in the hero and the closing band. |
| Code panel | File label bar (`--soft`), optional line numbers, Copy button, optional note line. Code copied exactly from the README. |
| Scope map | Inline SVG, theme-aware via tokens. Desktop 1100×410, phone 540×690 (the tenant block moves below). |
| Value row | Number · title + text · aside naming the code file that proves it. |
| Comparison table | Scroll inside the table only; sticky first column; Access Profiles column tinted with `--accent-soft`. Never page-level sideways scroll. |
| "When not to use" | List with a `−` marker in `--deny`. |
| FAQ | Native `<details>`; `+` / `−` marker in `--accent`. |
| Footer | Logo, resource links, then `SEISIGMA SRL • v{version}`. No personal name. |

## 6. Motion

Tokens (on `:root`):

```
--ease-out: cubic-bezier(.22,.61,.36,1);
--ease-in-out: cubic-bezier(.4,0,.2,1);
--dur-micro: 150ms;   /* hover, press, focus */
--dur-ui: 250ms;      /* copy feedback */
--dur-reveal: 600ms;  /* reveals */
--stagger: 60ms;
```

Motions per section (from `design/revisions/astra-v3-motion-notes.md`):

| Section | Motion | What it says |
|---|---|---|
| The problem — scope map | Wires draw holder → assignment → scopes; granted cells fade in at 800 ms; the denied cell stays still. The only hero moment. | Access flows to the granted scopes; deny does not move. |
| The problem — rows | Rows rise 16 px and fade in, 60 ms stagger, once. | — |
| Code walk-through | A connector draws before each step; the "Decision" label gets one slow pulse (2.4 s, infinite — the only loop). | One step leads to the next; a decision is made. |
| Copy buttons | "Copy" → check + "Copied" for 1.5 s, overlaid so layout never moves. | The command is on the clipboard. |
| Links, buttons, summaries | 1 px lift, 150 ms, on hover and `:focus-visible`. | — |
| Other headings | Opacity, 8 px blur and 12 px rise, once. | — |

Rules: CSS first; JS only for IntersectionObserver and copy (inline, no library). Only `transform`, `opacity`,
`filter` and `stroke-dashoffset` animate. Content is in the HTML; the hidden start state is set only after the
observer is ready (`.js` + `.pending`). With `prefers-reduced-motion: reduce` every animation and transition is off.
Print shows everything.

## 7. Docs site (Starlight)

Starlight's `--sl-color-*` variables map to the tokens above: accent → `--accent`, text → `--ink`, gray scale
from `--muted` / `--line` / `--soft`, background → `--bg`. Fonts: Manrope text, JetBrains Mono code. The header
uses the same logo. The footer line is the same as the landing page.
