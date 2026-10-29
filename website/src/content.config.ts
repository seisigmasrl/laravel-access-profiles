import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Rendered from the repo at build time; no copy lives in website/.
  repo: defineCollection({
    loader: glob({ pattern: ['CHANGELOG.md', 'docs/COMPARISON.md'], base: '..' }),
  }),
};
