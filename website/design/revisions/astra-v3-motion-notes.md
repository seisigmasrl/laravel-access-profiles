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
