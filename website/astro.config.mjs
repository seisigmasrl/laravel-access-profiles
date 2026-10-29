import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeRepoLinks from './src/lib/rehype-repo-links.mjs';

// Cloudflare Pages address (WEB.Q2). An own domain later only changes this line.
const site = 'https://laravel-access-profiles.pages.dev';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  redirects: { '/docs': '/docs/getting-started/' },
  markdown: { rehypePlugins: [rehypeRepoLinks] },
  vite: {
    plugins: [tailwindcss()],
    server: { fs: { allow: ['..'] } },
  },
  integrations: [
    starlight({
      title: 'Access Profiles',
      description: 'Scoped access profiles for multi-tenant Laravel apps.',
      favicon: '/favicon.svg',
      disable404Route: true,
      credits: false,
      lastUpdated: false,
      pagefind: true,
      customCss: [
        '@fontsource/manrope/400.css',
        '@fontsource/manrope/600.css',
        '@fontsource/manrope/700.css',
        '@fontsource/jetbrains-mono/400.css',
        './src/styles/starlight.css',
      ],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/seisigmasrl/laravel-access-profiles' },
      ],
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon-32.png', sizes: '32x32', type: 'image/png' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
        { tag: 'meta', attrs: { property: 'og:image', content: site + '/og-image.png' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: site + '/og-image.png' } },
      ],
      components: {
        SiteTitle: './src/components/DocsSiteTitle.astro',
        Footer: './src/components/DocsFooter.astro',
      },
      sidebar: [
        {
          label: 'Start',
          items: [
            { label: 'Getting started', link: '/docs/getting-started/' },
            { label: 'Concepts', link: '/docs/concepts/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Catalogue & templates', link: '/docs/catalogue-and-templates/' },
            { label: 'Checking access', link: '/docs/checking-access/' },
            { label: 'Scoped queries', link: '/docs/scoped-queries/' },
            { label: 'Events & audit', link: '/docs/events-and-audit/' },
            { label: 'Testing', link: '/docs/testing/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Comparison', link: '/docs/comparison/' },
            { label: 'Upgrading', link: '/docs/upgrading/' },
            { label: 'Changelog', link: '/docs/changelog/' },
          ],
        },
      ],
    }),
    sitemap(),
  ],
});
