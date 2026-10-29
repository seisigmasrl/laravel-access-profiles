#!/usr/bin/env node
// usage: node motion-check.mjs <file.html|dir> [more]   (a dir = every .html in it, for example dist/)
// Static check of the motion rules in references/motion.md (rules 1, 3, 4, 5, 6).
// Reads inline <style>/<script> and local linked .css/.js files; no browser. Exit 0 = all files pass.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const LAYOUT_PROPS = /^(width|height|min-width|min-height|max-width|max-height|top|left|right|bottom|inset|margin(-\w+)?|padding(-\w+)?|font-size|line-height|border-width|grid-template-\w+|flex-basis)$/;
const LIBS = /gsap|lottie|@rive-app|rive\.js|framer-motion|motion\.dev|animejs|velocity\.js|scrollmagic|aos\.js/i;
const MAX_INFINITE = 3;
const MIN_LOOP_MS = 1500;
const MAX_ONCE_MS = 800;
const MAX_TRANSITION_MS = 800;
const MAX_JS_GZIP = 3 * 1024;

const ms = (t) => (t.endsWith('ms') ? Number.parseFloat(t) : Number.parseFloat(t) * 1000);
const times = (s) => [...s.matchAll(/(?<![\w-])(\d*\.?\d+)(ms|s)\b/g)].map((m) => ms(m[1] + m[2]));

// A local href/src: relative to the HTML file, or to the site root (the first dir argument) when it starts with "/".
function local(ref, file, root) {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:')) return null;
  const clean = ref.split(/[?#]/)[0];
  const path = clean.startsWith('/') ? join(root, clean) : resolve(dirname(file), clean);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function check(file, root) {
  const html = readFileSync(file, 'utf8');
  const cssLinks = [...html.matchAll(/<link[^>]*rel="?stylesheet"?[^>]*>/gi)].map((m) => m[0].match(/href="([^"]+)"/)?.[1]).filter(Boolean);
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n')
    + '\n' + cssLinks.map((h) => local(h, file, root) ?? '').join('\n')
    + '\n' + [...html.matchAll(/\sstyle="([^"]*)"/gi)].map((m) => `x{${m[1]}}`).join('\n');
  const srcs = [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"/gi)].map((m) => m[1]);
  // Inline JS is the motion code (budget); linked local JS (framework islands) is only scanned for libraries.
  const inlineJs = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('\n');
  const js = inlineJs + '\n' + srcs.map((s) => local(s, file, root) ?? '').join('\n');
  const fail = [];
  const info = [];

  // Keyframes: only cheap properties.
  const frames = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)];
  for (const [, name, body] of frames) {
    const props = [...body.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    const bad = [...new Set(props.filter((p) => LAYOUT_PROPS.test(p)))];
    if (bad.length) fail.push(`rule 3: @keyframes ${name} animates layout ${bad.join(', ')}`);
  }

  // Animation declarations: loops and durations.
  const anims = [...css.matchAll(/animation(?:-duration)?\s*:\s*([^;}]+)/g)].map((m) => m[1].trim())
    .filter((v) => !/^(none|unset|initial|0s?)\b/.test(v));
  let infinite = 0;
  for (const a of anims) {
    for (const part of a.split(/,(?![^(]*\))/)) {
      const d = times(part)[0];
      if (/\binfinite\b/.test(part)) {
        infinite++;
        if (d !== undefined && d < MIN_LOOP_MS) fail.push(`rule 5: loop faster than ${MIN_LOOP_MS}ms: "${part.trim()}"`);
      } else if (d !== undefined && d > MAX_ONCE_MS) fail.push(`rule 6: one-time animation over ${MAX_ONCE_MS}ms: "${part.trim()}"`);
    }
  }
  if (infinite > MAX_INFINITE) fail.push(`rule 5: ${infinite} infinite animations (max ${MAX_INFINITE})`);

  // Transitions: no layout properties, no "all", not too slow.
  const trans = [...css.matchAll(/transition(?:-property)?\s*:\s*([^;}]+)/g)].map((m) => m[1].trim())
    .filter((v) => !/^(none|unset|initial|0s?)\b/.test(v));
  for (const t of trans) {
    for (const part of t.split(/,(?![^(]*\))/)) {
      const prop = part.trim().split(/\s+/)[0];
      if (prop === 'all') fail.push(`rule 3: "transition: all" (name the properties): "${part.trim()}"`);
      else if (LAYOUT_PROPS.test(prop)) fail.push(`rule 3: transition on layout property ${prop}`);
      const d = times(part)[0];
      if (d !== undefined && d > MAX_TRANSITION_MS) fail.push(`rule 6: transition over ${MAX_TRANSITION_MS}ms: "${part.trim()}"`);
    }
  }

  // Reduced motion: needed as soon as anything moves.
  const moves = frames.length + anims.length + trans.length > 0 || /\.animate\(|requestAnimationFrame/.test(js);
  const rm = [...css.matchAll(/@media[^{]*prefers-reduced-motion\s*:\s*reduce[^{]*\{((?:[^{}]*\{[^{}]*\})*[^{}]*)\}/g)].map((m) => m[1]).join('\n');
  if (moves && !/animation|transition/.test(rm)) fail.push('rule 1: no @media (prefers-reduced-motion: reduce) block that turns off animation/transition');
  if (/requestAnimationFrame|\.animate\(/.test(js) && !/prefers-reduced-motion/.test(js)) fail.push('rule 1: JS animation does not check matchMedia("(prefers-reduced-motion: reduce)")');

  // Scripts: no motion libraries, small inline JS.
  for (const s of srcs) if (LIBS.test(s)) fail.push(`rule 4: animation library script ${s}`);
  if (LIBS.test(js)) fail.push('rule 4: animation library code in the page JS');
  const gz = inlineJs.trim() ? gzipSync(inlineJs).length : 0;
  if (gz > MAX_JS_GZIP) fail.push(`rule 4: inline JS ${gz} B gzip (max ${MAX_JS_GZIP})`);

  info.push(`${frames.length} keyframes, ${anims.length} animations (${infinite} infinite), ${trans.length} transitions, inline JS ${gz} B gzip, reduced-motion ${rm ? 'yes' : 'no'}`);
  return { file, fail, info };
}

const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });
const args = process.argv.slice(2);
if (!args.length) { console.error('usage: motion-check.mjs <file.html|dir> [more]'); process.exit(2); }
const firstDir = args.find((a) => existsSync(a) && statSync(a).isDirectory());
const root = firstDir ?? dirname(args[0]);
const files = args.flatMap((a) => (statSync(a).isDirectory() ? walk(a) : [a]));
let bad = 0;
for (const f of files) {
  const r = check(f, root);
  console.log(`${r.fail.length ? 'FAIL' : 'PASS'} ${f}\n  ${r.info.join('\n  ')}`);
  for (const x of r.fail) console.log(`  - ${x}`);
  if (r.fail.length) bad++;
}
process.exit(bad ? 1 : 0);
