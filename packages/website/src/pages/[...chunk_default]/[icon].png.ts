import type { APIContext } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "./_index";

interface IconProps {
  size: number;
  background?: string;
}

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () => [
  {
    params: { icon: "favicon" },
    props: { size: 32 } satisfies IconProps,
  },

  // iOS fills transparency with black, so flatten onto white
  {
    params: { icon: "apple-touch-icon" },
    props: { size: 180, background: "#fff" } satisfies IconProps,
  },
]);

export async function GET({ props }: APIContext<IconProps>) {
  let image = sharp("src/media/favicon.png").resize(props.size, props.size);

  if (props.background) {
    image = image.flatten({ background: props.background });
  }

  const buffer = await image.png().toBuffer();
  const bytes = new Uint8Array(buffer);

  return new Response(bytes);
}
