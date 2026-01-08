import node from "@astrojs/node";
import react from "@astrojs/react";
import locales from "@blitzkit/i18n/locales.json";
import strings from "@blitzkit/i18n/strings/en.json";
import { mauve, mauveDark } from "@radix-ui/colors";
import favicons from "astro-favicons";
import { defineConfig } from "astro/config";
import packageJSON from "../../package.json";

const POSSIBLE_TARGETS = ["app", "web"];

const target = process.env.PUBLIC_TARGET;

if (!target || !POSSIBLE_TARGETS.includes(target)) {
  throw new Error("Invalid target");
}

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
  output: target === "web" ? "static" : "server",
  site: "https://blitzkit.app",
  outDir: "../../dist/website",
  prefetch: { defaultStrategy: "hover", prefetchAll: true },

  // build: { concurrency: 4 },
  adapter: target === "app" ? node({ mode: "standalone" }) : undefined,

  integrations: [
    favicons({
      name: strings.common.name,
      short_name: strings.common.name,

      background: mauveDark.mauve1,
      themes: [mauve.mauve1, mauveDark.mauve1],
      appleStatusBarStyle: "black-translucent",

      version: packageJSON.version,

      // shortcuts: Object.values(tools)
      //   .filter((tool) => !tool.disabled && !tool.href)
      //   .map((tool) => {
      //     const stringId = (tool.strings ??
      //       tool.id) as keyof typeof strings.website.tools;

      //     return {
      //       name: strings.website.tools[stringId].name,
      //       name_localized: wrapper(
      //         (strings) => strings.website.tools[stringId].name
      //       ),
      //       description: strings.website.tools[stringId].description,
      //       description_localized: wrapper(
      //         (strings) => strings.website.tools[stringId].description
      //       ),
      //       short_name: strings.website.tools[stringId].name,
      //       short_name_localized: wrapper(
      //         (strings) => strings.website.tools[stringId].name
      //       ),
      //       url: `/${tool.id}`,
      //       icon: `public/assets/tools/${tool.id}.webp`,
      //     };
      //   }),

      manifest: {
        // description: strings.website.home.seo_description,
        // description_localized: wrapper(
        //   (strings) => strings.website.home.seo_description
        // ),

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

    react(),
  ],
});
