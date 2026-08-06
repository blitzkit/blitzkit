import { fetchGlossary, type Avatar } from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import type { APIContext, GetStaticPathsItem } from "astro";
import { extname } from "path";
import { mixStaticPaths } from "../../../../../core/blitzkit/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const avatars: Record<string, { avatar: Avatar; url: string }> = {};

  await Promise.all(
    locales.supported.map(async (supported) => {
      const glossary = await fetchGlossary(supported.blitz ?? supported.locale);

      console.log(
        `Found ${Object.keys(glossary).length} things for ${supported.locale}`,
      );

      for (const key in glossary) {
        const glossaryEntry = glossary[key];

        if (
          !key.startsWith("avatar") ||
          key.endsWith("_part") ||
          glossaryEntry.image_url === null
        ) {
          continue;
        }

        if (key in avatars) {
          avatars[key].avatar.name!.locales[supported.locale] =
            glossaryEntry.title;
        } else {
          const extension = extname(glossaryEntry.image_url);

          avatars[key] = {
            url: glossaryEntry.image_url,
            avatar: {
              id: key,
              name: { locales: { [supported.locale]: glossaryEntry.title } },
              extension,
            },
          };
        }
      }
    }),
  );

  await Promise.all(
    Object.entries(avatars).map(async ([key, { url, avatar }]) => {
      if (!(locales.default in avatars[key].avatar.name!.locales)) {
        console.warn(`Avatar ${key} has no ${locales.default} name`);
        return;
      }

      const name = `${key}${avatar.extension}`;

      paths.push({
        params: { name },
        props: { url },
      });
    }),
  );

  return paths;
});

export async function GET({ props }: APIContext<{ url: string }>) {
  if (import.meta.env.DEV) {
    return Response.redirect(props.url);
  }

  const response = await fetch(props.url);
  const buffer = await response.arrayBuffer();

  return new Response(buffer);
}
