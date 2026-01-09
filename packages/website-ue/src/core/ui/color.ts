import type * as colors from "@radix-ui/colors";

const ignoreEndings = ["A", "P3", "Dark", "DarkA", "DarkP3"] as const;
export type Color = Exclude<
  keyof typeof colors,
  `${string}${(typeof ignoreEndings)[number]}` | "__esModule"
>;
