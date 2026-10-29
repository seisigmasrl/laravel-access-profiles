// The site version is the first `## x.y.z - date` heading of the repo CHANGELOG.md (WEB.Q11 A).
// Builds run from website/ (locally and on Cloudflare Pages), so the repo root is one level up.
// import.meta.url is not used: the bundled chunk lives in dist/.prerender, not in src/lib.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const changelogPath = resolve(process.cwd(), '..', 'CHANGELOG.md');

export function readRelease() {
  const text = readFileSync(changelogPath, 'utf8');
  const match = text.match(/^## (\d+\.\d+\.\d+) - (.+)$/m);
  if (!match) {
    throw new Error(`No "## x.y.z - date" heading in ${changelogPath}`);
  }
  return { version: match[1], date: match[2].trim() };
}
