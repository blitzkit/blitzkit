import react from "@astrojs/react";
import strings from "@blitzkit/i18n/strings/en.json";
import { mauve, mauveDark } from "@radix-ui/colors";
import favicons from "astro-favicons";
import { defineConfig } from "astro/config";
import packageJSON from "../../package.json";

export default defineConfig({
  devToolbar: { enabled: false },

  vite: {
    server: { allowedHosts: [] },

    esbuild: {
      minifyIdentifiers: true,
      minifySyntax: false,
      minifyWhitespace: true,
    },
  },
  output: "static",
  site: "https://blitzkit.app",
  outDir: "../../dist/website",
  prefetch: { defaultStrategy: "hover", prefetchAll: true },

  build: { concurrency: 4 },
  adapter: undefined,

  integrations: [
    favicons({
      name: strings.common.name,
      short_name: strings.common.name,

      background: mauveDark.mauve1,
      themes: [mauve.mauve1, mauveDark.mauve1],
      appleStatusBarStyle: "black-translucent",

      version: packageJSON.version,
    }),

    react(),
  ],
});
