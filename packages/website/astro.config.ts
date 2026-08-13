import react from "@astrojs/react";
import { wrapper } from "@blitzkit/i18n";
import locales from "@blitzkit/i18n/locales.json";
import strings from "@blitzkit/i18n/strings/en.json";
import { mauve, mauveDark } from "@radix-ui/colors";
import AstroPWA from "@vite-pwa/astro";
import favicons from "astro-favicons";
import { defineConfig } from "astro/config";
import packageJSON from "../../package.json";
import { tools } from "./src/constants/tools";

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

      background: mauveDark.mauve1,
      themes: [mauve.mauve1, mauveDark.mauve1],
      appleStatusBarStyle: "black-translucent",

      version: packageJSON.version,

      shortcuts: Object.entries(tools)
        .filter(([, tool]) => !tool.href)
        .map(([id, tool]) => {
          const stringId = (tool.strings ??
            id) as keyof typeof strings.website.tools;

          return {
            name: strings.website.tools[stringId].name,
            name_localized: wrapper(
              (strings) => strings.website.tools[stringId].name,
            ),
            description: strings.website.tools[stringId].description,
            description_localized: wrapper(
              (strings) => strings.website.tools[stringId].description,
            ),
            short_name: strings.website.tools[stringId].name,
            short_name_localized: wrapper(
              (strings) => strings.website.tools[stringId].name,
            ),
            url: `/${tool.path ?? id}`,
            icon: `public/assets/images/tools/${tool.path}.webp`,
          };
        }),

      manifest: {
        description: strings.website.home.seo_description,
        description_localized: wrapper(
          (strings) => strings.website.home.seo_description,
        ),

        dir: "ltr",
        categories: ["utilities", "games", "developer", "developer tools"],

        id: "com.tresabhi.blitzkit",
        start_url: "/",
        launch_handler: { client_mode: "navigate-new" },
        display: "fullscreen",
        display_override: ["fullscreen", "standalone", "minimal-ui"],

        lang: locales.default,
        orientation: "any",
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

    AstroPWA({
      manifest: false,
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ["**/*.{html,css,js,png,webp,svg,xml,json}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.href.startsWith(import.meta.env.PUBLIC_ASSET_BASE),
            handler: "NetworkFirst",
          },
        ],
      },
    }),

    react(),
  ],
});
