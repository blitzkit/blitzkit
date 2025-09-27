// @ts-check
import strings from "@blitzkit/i18n/strings/en.json";
import AstroPWA from "@vite-pwa/astro";
import favicons from "astro-favicons";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import { wrapper } from "@blitzkit/i18n";
import { mauve, mauveDark } from "@radix-ui/colors";
import { tools } from "./src/constants/tools";

export default defineConfig({
  devToolbar: { enabled: false },

  integrations: [
    favicons({
      name: strings.common.name,
      short_name: strings.common.name,

      background: mauveDark.mauve1,
      themes: [mauve.mauve1, mauveDark.mauve1],
      appleStatusBarStyle: "black-translucent",

      shortcuts: Object.values(tools)
        .filter((tool) => !tool.disabled && !tool.href)
        .map((tool) => {
          const stringId = (tool.strings ??
            tool.id) as keyof typeof strings.website.tools;

          return {
            name: strings.website.tools[stringId].name,
            name_localized: wrapper(
              (strings) => strings.website.tools[stringId].name
            ),
            description: strings.website.tools[stringId].description,
            description_localized: wrapper(
              (strings) => strings.website.tools[stringId].description
            ),
            short_name: strings.website.tools[stringId].name,
            short_name_localized: wrapper(
              (strings) => strings.website.tools[stringId].name
            ),
            url: `/${tool.id}`,
          };
        }),

      manifest: {
        start_url: "/",
        display: "fullscreen",
        display_override: ["fullscreen", "standalone", "minimal-ui"],
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

    AstroPWA({ manifest: false }),

    react(),
  ],
});
