import type { APIContext, GetStaticPathsItem } from "astro";
import { readdirSync } from "fs";
import { parse } from "path";
import sharp from "sharp";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../_index";

interface HeroProps {
  path: string;
}

const HEROS = "src/media/heros";
const HERO_HEIGHT = 800;

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () =>
  readdirSync(HEROS).map(
    (file) =>
      ({
        params: { season: parse(file).name },
        props: { path: `${HEROS}/${file}` } satisfies HeroProps,
      }) satisfies GetStaticPathsItem,
  ),
);

export async function GET({ props }: APIContext<HeroProps>) {
  const image = await sharp(props.path)
    .resize({ height: HERO_HEIGHT })
    .webp()
    .toBuffer();

  return new Response(new Uint8Array(image));
}
