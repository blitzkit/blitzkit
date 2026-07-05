import cssnano from "cssnano";
import type { Config } from "postcss-load-config";
import postcssPresetEnv from "postcss-preset-env";

export default {
  plugins: [
    require("autoprefixer"),
    require("postcss-nested"),

    cssnano({
      preset: "default",
    }),

    postcssPresetEnv({
      features: {},
    }),
  ],
} satisfies Config;
