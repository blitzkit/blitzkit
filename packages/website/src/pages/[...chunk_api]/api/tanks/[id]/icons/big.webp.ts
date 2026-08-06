import {
  NATION_IDS,
  type TankParameters,
  type VehicleDefinitionList,
} from "@blitzkit/core";
import type { APIContext } from "astro";
import sharp from "sharp";
import { parsePackedSpriteRect } from "../../../../../../core/blitz/parsePackedSpriteRect";
import { vfs } from "../../../../../../core/blitzkit/vfs";

export { getStaticPaths } from "../_index";

export async function GET({ props }: APIContext<{ id: number }>) {
  const nations = await vfs
    .dir(`Data/XML/item_defs/vehicles`)
    .then((files) => files.filter((nation) => nation !== "common"));

  for (const nation of nations) {
    const tanks = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`,
    );

    for (const tankKey in tanks.root) {
      const tank = tanks.root[tankKey];

      if (tankKey.includes("tutorial_bot")) continue;

      const nationVehicleId = tank.id;
      const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;

      if (id !== props.id) continue;

      const parameters = await vfs.yaml<TankParameters>(
        `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
      );
      const bigPath = `Data/${parameters.resourcesPath.bigIconPath
        .replace(/~res:\//, "")
        .replace(/\..+/, "")}.packed.webp`;
      const big = await extractPackedTankIcon(await vfs.file(bigPath));

      return new Response(big);
    }
  }
}

export async function extractPackedTankIcon(bytes: Uint8Array) {
  const texture = sharp(bytes);
  const spriteRect = parsePackedSpriteRect(bytes);

  if (!spriteRect) {
    throw new Error(`Missing RIFF sprite bounds`);
  }

  const [left, top, width, height] = spriteRect;
  const bounds = [left, top, width, height];

  if (!bounds.every(Number.isInteger)) {
    throw new Error(`Invalid RIFF sprite bounds: ${bounds.join(" ")}`);
  }

  const metadata = await texture.metadata();

  if (metadata.width === undefined || metadata.height === undefined) {
    throw new Error(`Failed to read image dimensions`);
  }

  if (
    left < 0 ||
    top < 0 ||
    width <= 0 ||
    height <= 0 ||
    left + width > metadata.width ||
    top + height > metadata.height
  ) {
    throw new Error(
      `Out-of-bounds RIFF sprite: ${bounds.join(" ")} in ${metadata.width}x${metadata.height}`,
    );
  }

  const buffer = await texture.extract({ left, top, width, height }).toBuffer();
  const array = new Uint8Array(buffer);

  return array;
}
