import type { APIContext, GetStaticPathsItem } from "astro";
import { existsSync } from "fs";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../../astro/mixStaticPaths";
import {
  TOOL_BANNER_HEIGHTS,
  ToolBannerSize,
  tools,
} from "../../../../../constants/tools";
import { getStaticPaths as _getStaticPaths } from "../../../_index";

interface ToolBannerProps {
  tool: string;
  size: ToolBannerSize;
}

const BANNER_EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

function bannerPath(tool: string) {
  return BANNER_EXTENSIONS.map(
    (extension) => `src/media/banners/${tool}.${extension}`,
  ).find((path) => existsSync(path));
}

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () =>
  Object.values(tools)
    .filter((tool) => bannerPath(tool.id) !== undefined)
    .flatMap((tool) =>
      Object.values(ToolBannerSize).map(
        (size) =>
          ({
            params: { tool: tool.id, size },
            props: { tool: tool.id, size } satisfies ToolBannerProps,
          } satisfies GetStaticPathsItem),
      ),
    ),
);

export async function GET({ props }: APIContext<ToolBannerProps>) {
  const height = TOOL_BANNER_HEIGHTS[props.size];
  let image = sharp(bannerPath(props.tool)!);

  if (height !== null) image = image.resize({ height });

  return new Response(new Uint8Array(await image.webp().toBuffer()));
}
