/**
 * @file astro.config.mjs
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.jimmykurian.me',
  trailingSlash: 'always',
  // The /resume/ page only exists to be printed to /resume.pdf.
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/resume/') })],
  // Book covers for /reading/ are downloaded from Goodreads and optimized at build time.
  image: { domains: ['i.gr-assets.com'] },
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
  // Downloaded at build time and served from /_astro, so no third-party font requests.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Newsreader',
      cssVariable: '--font-serif',
      weights: ['400 600'],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Libre Franklin',
      cssVariable: '--font-sans',
      weights: ['400 600'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],
});
