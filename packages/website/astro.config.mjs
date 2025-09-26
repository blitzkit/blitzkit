// @ts-check

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { SUPPORTED_LOCALES } from "@blitzkit/i18n";
import strings from "@blitzkit/i18n/strings/en.json";
import favicons from "astro-favicons";
import { defineConfig } from "astro/config";

export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: [...SUPPORTED_LOCALES],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  devToolbar: { enabled: false },
  output: "static",
  site: "https://blitzkit.app",
  outDir: "../../dist/website",
  prefetch: true,

  integrations: [
    react(),
    sitemap(),
    favicons({
      name: strings.common.name,
      short_name: strings.common.name,

      manifest: {
        start_url: "/",
        display_override: ["minimal-ui"],
      },

      icons: {
        windows: true,
        android: true,
        appleIcon: true,
        appleStartup: true,
        favicons: true,
        yandex: true,
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "../../node_modules/.prisma/client/index-browser.js",
      },
    },
    ssr: {
      noExternal: [/^d3.*$/, /^@nivo.*$/],
    },
  },
});
