import * as colors from "@radix-ui/colors";
import type { APIContext, GetStaticPaths } from "astro";

const ignoreEndings = ["A", "P3", "Dark", "DarkA", "DarkP3"] as const;

const filtered = Object.keys(colors).filter(
  (name) =>
    !ignoreEndings.some((ending) => name.endsWith(ending)) &&
    name !== "__esModule"
);

export const getStaticPaths = (() => {
  return filtered.map((accent) => ({
    params: { accent },
  }));
}) satisfies GetStaticPaths;

export type Color = Exclude<
  keyof typeof colors,
  `${string}${(typeof ignoreEndings)[number]}` | "__esModule"
>;

export async function GET({ params }: APIContext<{}, { accent: Color }>) {
  const palette = colors[`${params.accent}Dark`];
  let content = ":root{";

  for (const key in palette) {
    const dashedKey = key.replace(/([a-zA-Z])(\d+)/, "$1-$2");
    content += `--${dashedKey}:${palette[key as keyof typeof palette]};`;
  }

  content += "}";

  return new Response(content);
}
