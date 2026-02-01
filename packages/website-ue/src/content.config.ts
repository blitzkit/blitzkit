import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

const api = defineCollection({
  loader() {
    const globbed = import.meta.glob("./pages/api/**/*.ts", {
      eager: true,
      query: "?raw",
      import: "default",
    });

    const paths: { id: string; docs: string }[] = [];

    for (const path in globbed) {
      const id = path.replace("./pages/api/", "").replace(".ts", "");

      const body = (globbed[path] as string).replaceAll("\r\n", "\n");
      const docs = body
        .match(
          /\/\*\*\n((( \*.*)\n)+) \*\/\nexport (async )?function GET\(/,
        )?.[1]
        .replaceAll(/^ \* ?/gm, "");

      if (!docs) continue;

      paths.push({ id, docs });
    }

    return paths;
  },

  schema: z.object({
    docs: z.optional(z.string()),
  }),
});

const docs = defineCollection({
  loader: glob({ base: "../../docs", pattern: "**/*.md" }),
});

export const collections = { api, docs };
