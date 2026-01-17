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

    const paths: { id: string; body: string }[] = [];

    for (const path in globbed) {
      const id = path.replace("./pages/api/", "").replace(".ts", "");
      const body = (globbed[path] as string).replaceAll("\r\n", "\n");
      const docs = body.match(
        /\/\*\*\n((( \*.*)\n)+) \*\/\nexport (async )?function GET\(/
      )?[1].spl;

      paths.push({ id, body, docs: docs?.[1] ?? undefined });
    }

    return paths;
  },

  schema: z.object({
    body: z.string(),
    docs: z.optional(z.string()),
  }),
});

const docs = defineCollection({
  loader: glob({ base: "../../docs", pattern: "**/*.md" }),
});

export const collections = { api, docs };
