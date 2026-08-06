import {
  NATION_IDS,
  type TankParameters,
  type VehicleDefinitionList,
} from "@blitzkit/core";
import type { APIContext } from "astro";
import { vfs } from "../../../../../../core/blitzkit/vfs";
import { extractPackedTankIcon } from "./big.webp";

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
      const bigPath = `Data/${parameters.resourcesPath.smallIconPath
        .replace(/~res:\//, "")
        .replace(/\..+/, "")}.packed.webp`;
      const big = await extractPackedTankIcon(await vfs.file(bigPath));

      return new Response(big);
    }
  }
}
