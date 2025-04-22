// @ts-check

import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { SUPPORTED_LOCALES } from '@blitzkit/i18n';
import { defineConfig } from 'astro/config';

export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: [...SUPPORTED_LOCALES],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  devToolbar: { enabled: false },
  output: 'static',
  site: 'https://blitzkit.app',
  outDir: '../../dist/website',
  prefetch: true,

  integrations: [react(), sitemap(), partytown()],
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser':
          '../../node_modules/.prisma/client/index-browser.js',
      },
    },
    ssr: {
      noExternal: [/^d3.*$/, /^@nivo.*$/],
    },
  },
});
