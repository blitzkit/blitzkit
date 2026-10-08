import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import {
  docImageId,
  externalDocImages,
} from "../../../../core/blitzkit/docImages";
import { mixStaticPaths } from "../../../../core/blitzkit/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const documents = import.meta.glob<string>(
    "../../../../../../../docs/**/*.md",
    { eager: true, query: "?raw", import: "default" },
  );
  const urls = new Set(Object.values(documents).flatMap(externalDocImages));

  return Array.from(
    urls,
    (url) =>
      ({
        params: { id: docImageId(url) },
        props: { url },
      }) satisfies GetStaticPathsItem,
  );
});

export async function GET({ props }: APIContext<{ url: string }>) {
  const response = await fetch(props.url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${props.url}: ${response.status}`);
  }

  const image = await sharp(Buffer.from(await response.arrayBuffer()))
    .webp()
    .toBuffer();

  return new Response(new Uint8Array(image));
}
