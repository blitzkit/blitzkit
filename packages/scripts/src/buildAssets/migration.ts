import { toUniqueId } from "@blitzkit/core";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";
import { VehicleDefinitionList } from "./definitions";

export async function migration() {
  console.log("Building migration map...");

  using uploader = new AssetUploader("migration map");
  const map: Record<string, number> = {};
  const nations = vfs.dir(`Data/XML/item_defs/vehicles`).filter((nation) => nation !== "common");

  for (const nation of nations) {
    const tankList = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`
    );

    for (const tankKey in tankList.root) {
      const tank = tankList.root[tankKey];
      const tankId = toUniqueId(nation, tank.id);
      const davaKey = `${nation}:${tankKey}`;

      map[davaKey] = tankId;
    }
  }

  await uploader.add({
    path: "definitions/migration.json",
    content: new TextEncoder().encode(JSON.stringify(map)),
  });
  await uploader.flush();
}
