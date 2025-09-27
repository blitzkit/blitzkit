// @ts-check
import strings from "@blitzkit/i18n/strings/en.json";
import favicons from "astro-favicons";
import { defineConfig } from "astro/config";

import react from "@astrojs/react";

export default defineConfig({
  devToolbar: { enabled: false },

  integrations: [
    favicons({
      name: strings.common.name,
      short_name: strings.common.name,

      manifest: { start_url: "/", display_override: ["minimal-ui"] },

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
