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

    esbuild: { target: "es2022" },

    build: {
      rollupOptions: {
        external: ["@blitzkit/game"],
      },
    },
  },
  output: "static",
  site: "https://blitzkit.app",
  outDir: "../../dist/website",
  prefetch: { defaultStrategy: "hover", prefetchAll: true },

  build: { concurrency: 2 },
  adapter: undefined,

  integrations: [favicons(), react()],
});
