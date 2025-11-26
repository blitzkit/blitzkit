import { NATION_IDS } from "@blitzkit/core";
import sharp from "sharp";
import type { Vector3Tuple } from "three";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";
import type { VehicleDefinitionList } from "./definitions";

export interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
  collision: {
    [key: string]: {
      points: Vector3Tuple;
      bbox: {
        min: Vector3Tuple;
        max: Vector3Tuple;
      };
      averageThickness?: Record<string, number>;
    };
  };
  maskSlice?: {
    [key: string]:
      | {
          enabled: boolean;
          planePosition: Vector3Tuple;
          planeNormal: Vector3Tuple;
          planeAxis: Vector3Tuple;
          frustumConeBaseRadius: number;
          frustumConeAngleDegrees: number;
          planeSliceMode: number;
          frustumConeSliceMode: number;
        }
      | undefined;
  };
}

export async function tankIcons() {
  console.log("Building tank icons...");

  using uploader = new AssetUploader("tank icons");
  const nations = vfs.dir(`Data/XML/item_defs/vehicles`).filter((nation) => nation !== "common")

  for (const nation of nations) {
    const tanks = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`
    );

    for (const tankKey in tanks.root) {
      const tank = tanks.root[tankKey];

      if (tankKey.includes("tutorial_bot")) continue;

      const nationVehicleId = tank.id;
      const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;

      const parameters = await vfs.yaml<TankParameters>(
        `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`
      );
      const smallPath = `Data/${parameters.resourcesPath.smallIconPath
        .replace(/~res:\//, "")
        .replace(/\..+/, "")}.packed.webp`;
      const bigPath = `Data/${parameters.resourcesPath.bigIconPath
        .replace(/~res:\//, "")
        .replace(/\..+/, "")}.packed.webp`;
      const big = await sharp(await vfs.file(bigPath))
        .trim()
        .toBuffer();
      const small = await sharp(await vfs.file(smallPath))
        .trim()
        .toBuffer();

      if (big) {
        await uploader.add({
          content: big,
          path: `icons/tanks/big/${id}.webp`,
        });
      }
      if (small) {
        await uploader.add({
          content: small,
          path: `icons/tanks/small/${id}.webp`,
        });
      }
    }
  }

  await uploader.flush();
}
