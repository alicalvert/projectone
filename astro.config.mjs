// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://projectone.me',
  adapter: cloudflare(),
  integrations: [
    sitemap({
      // /privacy is noindexed — keep it out of the sitemap
      filter: (page) => !page.includes('/privacy'),
    }),
  ]
});
