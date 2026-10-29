#!/usr/bin/env node
// Web proof gates for a static site build, for code-forge `gates.custom`.
// usage: node cf-web-check.mjs <seo|links|lighthouse|shots> [--dist dist] [--out reports] [--pages 8]
//   seo         every page: <html lang>, one <title>, meta description, one <h1>, canonical; sitemap.xml and robots.txt exist
//   links       every internal href/src in every page points to a file in the build
//   lighthouse  mobile Lighthouse per page (needs Chrome); budget perf 90, a11y 95, SEO 95, best practices 95
//               → <out>/lighthouse/<page>.json; perf under budget while load > CPUs ⇒ one rerun (budget never lowered)
//   shots       Chrome headless screenshots at 390x844 and 1440x900 → <out>/shots/<page>-<w>.png
// Exit 0 = pass, 1 = fail, 2 = usage. No npm dependency except `npx lighthouse` for the lighthouse check.
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { availableParallelism, loadavg } from 'node:os';

const [check, ...rest] = process.argv.slice(2);
const flag = (name, dflt) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : dflt; };
const dist = resolve(flag('dist', 'dist'));
const out = resolve(flag('out', 'reports'));
const maxPages = Number(flag('pages', '8'));
const BUDGET = { performance: 90, accessibility: 95, seo: 95, 'best-practices': 95 };

if (!['seo', 'links', 'lighthouse', 'shots'].includes(check)) { console.error('usage: cf-web-check.mjs <seo|links|lighthouse|shots> [--dist dist] [--out reports] [--pages 8]'); process.exit(2); }
if (!existsSync(dist)) { console.error(`no build folder ${dist}: run the build first`); process.exit(1); }

const walk = (dir) => readdirSync(dir).flatMap((name) => { const p = join(dir, name); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(dist).filter((p) => p.endsWith('.html')).sort();
const urlOf = (file) => '/' + relative(dist, file).split(sep).join('/').replace(/index\.html$/, '');
const slugOf = (file) => (urlOf(file).replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-') || 'home');
const failures = [];
const fail = (msg) => failures.push(msg);

function finish() {
  for (const f of failures) console.log(`FAIL ${f}`);
  console.log(failures.length ? `${check}: ${failures.length} problem(s)` : `${check}: ok (${pages.length} pages)`);
  process.exit(failures.length ? 1 : 0);
}

const count = (html, re) => (html.match(re) ?? []).length;

if (check === 'seo') {
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    const u = urlOf(file);
    if (/<meta[^>]+http-equiv=["']?refresh/i.test(html)) continue; // a redirect page
    if (!/<html[^>]*\blang=["'][^"']+["']/i.test(html)) fail(`${u}: <html> has no lang`);
    if (count(html, /<title>[^<]+<\/title>/gi) !== 1) fail(`${u}: needs exactly one non-empty <title>`);
    if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html)) fail(`${u}: meta description missing or under 20 characters`);
    if (count(html, /<h1[\s>]/gi) !== 1) fail(`${u}: needs exactly one <h1>`);
    if (!/<link[^>]+rel=["']canonical["']/i.test(html) && !u.startsWith('/404')) fail(`${u}: no canonical link`);
  }
  const sitemap = existsSync(join(dist, 'sitemap.xml')) || existsSync(join(dist, 'sitemap-index.xml'));
  if (!sitemap) fail('no sitemap.xml or sitemap-index.xml');
  if (!existsSync(join(dist, 'robots.txt'))) fail('no robots.txt');
  finish();
}

if (check === 'links') {
  for (const file of pages) {
    const html = readFileSync(file, 'utf8');
    for (const [, ref] of html.matchAll(/\s(?:href|src)=["']([^"'#?]+)/gi)) {
      if (/^(?:[a-z]+:|\/\/)/i.test(ref)) continue; // external, mailto:, tel:, data:
      const target = ref.startsWith('/') ? join(dist, ref) : join(file, '..', ref);
      const ok = [target, join(target, 'index.html'), `${target}.html`].some((p) => existsSync(p) && statSync(p).isFile());
      if (!ok) fail(`${urlOf(file)}: broken link ${ref}`);
    }
  }
  finish();
}

// lighthouse and shots need the site served over http
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(dist, path);
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!existsSync(file)) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'max-age=31536000' });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;
const chosen = pages.filter((p) => !urlOf(p).startsWith('/404')).slice(0, maxPages);
const CHROME = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => existsSync(p));
const run = (cmd, args) => new Promise((ok) => {
  // async spawn so the local server keeps answering while the child runs
  import('node:child_process').then(({ spawn }) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => ok({ code, err }));
  });
});

if (check === 'lighthouse') {
  mkdirSync(join(out, 'lighthouse'), { recursive: true });
  if (!CHROME) { fail('Chrome not found (set CHROME_PATH)'); server.close(); finish(); }
  // Performance is CPU-bound: on a busy machine a fast page can score low. The budget never drops;
  // when perf misses it while load is above the CPU count, the page is measured once more.
  const busy = () => loadavg()[0] > availableParallelism();
  for (const file of chosen) {
    const report = join(out, 'lighthouse', `${slugOf(file)}.json`);
    let scores = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await run('npx', ['-y', 'lighthouse@13.5.0', base + urlOf(file), '--quiet', '--output=json', `--output-path=${report}`,
        '--only-categories=performance,accessibility,seo,best-practices', '--chrome-flags=--headless=new --no-first-run']);
      if (res.code !== 0 || !existsSync(report)) { fail(`${urlOf(file)}: lighthouse did not run (${res.err.trim().split('\n').pop()})`); break; }
      const { categories, environment } = JSON.parse(readFileSync(report, 'utf8'));
      scores = Object.fromEntries(Object.keys(BUDGET).map((k) => [k, Math.round((categories[k]?.score ?? 0) * 100)]));
      const load = loadavg()[0].toFixed(0);
      console.log(`${urlOf(file)} ${Object.entries(scores).map(([k, v]) => `${k}=${v}`).join(' ')} load=${load} cpus=${availableParallelism()} benchmarkIndex=${environment?.benchmarkIndex ?? '?'}${attempt > 1 ? ' (rerun)' : ''}`);
      if (scores.performance >= BUDGET.performance || attempt === 2 || !busy()) break;
    }
    if (scores) for (const [k, min] of Object.entries(BUDGET)) if (scores[k] < min) fail(`${urlOf(file)}: ${k} ${scores[k]} < ${min}`);
  }
  server.close(); finish();
}

if (check === 'shots') {
  mkdirSync(join(out, 'shots'), { recursive: true });
  const profile = join(out, '.chrome-profile'); // own profile: never touches the user's open Chrome
  if (!CHROME) { fail('Chrome not found (set CHROME_PATH)'); server.close(); finish(); }
  for (const file of chosen) {
    for (const [w, h] of [[390, 844], [1440, 900]]) {
      const png = join(out, 'shots', `${slugOf(file)}-${w}.png`);
      const shoot = () => run(CHROME, ['--headless=new', '--no-first-run', `--user-data-dir=${profile}`, '--hide-scrollbars', `--window-size=${w},${h}`, `--screenshot=${png}`, base + urlOf(file)]);
      let res = await shoot();
      if (res.code !== 0 || !existsSync(png)) res = await shoot(); // one retry: a busy machine can drop a headless shot
      if (res.code !== 0 || !existsSync(png)) fail(`${urlOf(file)} at ${w}px: no screenshot`);
    }
  }
  server.close(); finish();
}
