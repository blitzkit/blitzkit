import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  devToolbar: { enabled: false },

  vite: {
    server: { allowedHosts: [] },
    esbuild: { target: "es2022" },
    build: { cssCodeSplit: false },
    css: {
      modules: {
        // Short hashed class names in production to shrink HTML; the leading _ keeps names that start with a digit valid
        generateScopedName:
          process.env.NODE_ENV === "production"
            ? "_[hash:base64:6]"
            : undefined,
      },
    },
  },

  output: "static",
  site: "https://blitzkit.app",
  outDir: "../../dist/website",
  prefetch: { defaultStrategy: "hover", prefetchAll: true },

  build: { concurrency: 8, inlineStylesheets: "never" },

  integrations: [react()],
});
