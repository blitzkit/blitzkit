import react from "@astrojs/react";
import strings from "@blitzkit/i18n/strings/en.json";
import favicons from "astro-favicons";
import { defineConfig } from "astro/config";

export default defineConfig({
  devToolbar: { enabled: false },

  vite: {
    server: { allowedHosts: [] },
    esbuild: { target: "es2022" },
  },

  output: "static",
  site: "https://blitzkit.app",
  outDir: "../../dist/website",
  prefetch: { defaultStrategy: "hover", prefetchAll: true },

  build: { concurrency: 4 },

  integrations: [
    favicons({
      name: strings.common.name,
      short_name: strings.common.name,

      icons: {
        windows: true,
        android: true,
        appleIcon: true,
        appleStartup: true,
        favicons: true,
        yandex: true,
      },
    }),

    react(),
  ],
});
