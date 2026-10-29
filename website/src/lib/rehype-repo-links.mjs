// Repo files rendered on the site (CHANGELOG.md, docs/COMPARISON.md) keep their GitHub-relative links.
// This plugin points them at GitHub, sends changelog links to /docs/changelog/, and drops the file's own h1
// because Starlight prints the page title.
import path from 'node:path';

const repo = 'https://github.com/seisigmasrl/laravel-access-profiles/blob/main/';
const repoFiles = ['CHANGELOG.md', path.join('docs', 'COMPARISON.md')];

function visit(node, fn) {
  fn(node);
  for (const child of node.children ?? []) visit(child, fn);
}

export default function rehypeRepoLinks() {
  return (tree, file) => {
    const filePath = file.path ?? file.history?.[0] ?? '';
    const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
    const relative = path.relative(root, filePath);
    if (!repoFiles.includes(relative)) return;
    const dir = path.dirname(relative);

    tree.children = tree.children.filter((n) => !(n.type === 'element' && n.tagName === 'h1'));
    visit(tree, (node) => {
      const href = node.type === 'element' && node.tagName === 'a' ? node.properties?.href : null;
      if (typeof href !== 'string' || /^([a-z]+:|#|\/)/i.test(href)) return;
      const [target, hash] = href.split('#');
      const resolved = path.posix.normalize(path.posix.join(dir.split(path.sep).join('/'), target));
      if (resolved === 'CHANGELOG.md') {
        node.properties.href = '/docs/changelog/' + (hash ? '#' + hash : '');
      } else if (resolved === 'docs/COMPARISON.md') {
        node.properties.href = '/docs/comparison/' + (hash ? '#' + hash : '');
      } else {
        node.properties.href = repo + resolved + (hash ? '#' + hash : '');
      }
    });
  };
}
