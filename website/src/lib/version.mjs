// The site version is the highest stable release on Packagist, fetched once per build.
// If Packagist cannot be reached, it falls back to the first `## x.y.z - date` heading of CHANGELOG.md (WEB.Q11 A).
// Builds run from website/ (locally and on Cloudflare Pages), so the repo root is one level up.
// import.meta.url is not used: the bundled chunk lives in dist/.prerender, not in src/lib.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const changelogPath = resolve(process.cwd(), '..', 'CHANGELOG.md');

const packageName = 'seisigmasrl/laravel-access-profiles';
const packagistUrl = `https://repo.packagist.org/p2/${packageName}.json`;
const timeoutMs = 5000;

export function readRelease() {
  const text = readFileSync(changelogPath, 'utf8');
  const match = text.match(/^## (\d+\.\d+\.\d+) - (.+)$/m);
  if (!match) {
    throw new Error(`No "## x.y.z - date" heading in ${changelogPath}`);
  }
  return { version: match[1], date: match[2].trim() };
}

// Highest x.y.z among the tags; dev-*, alpha, beta and RC never match.
function highestStable(versions) {
  const stable = versions
    .map((v) => String(v).replace(/^v/, ''))
    .filter((v) => /^\d+\.\d+\.\d+$/.test(v))
    .map((v) => v.split('.').map(Number));
  if (stable.length === 0) return null;
  stable.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  return stable[0].join('.');
}

async function fetchPackagistVersion() {
  const response = await fetch(packagistUrl, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  const version = highestStable((body?.packages?.[packageName] ?? []).map((p) => p.version));
  if (!version) throw new Error('no stable version listed');
  return version;
}

let cached;

// One fetch per build: every page awaits the same promise.
export function readVersion() {
  cached ??= fetchPackagistVersion().catch((error) => {
    const { version } = readRelease();
    console.warn(`[version] Packagist unavailable (${error.message}); using CHANGELOG.md v${version}.`);
    return version;
  });
  return cached;
}
