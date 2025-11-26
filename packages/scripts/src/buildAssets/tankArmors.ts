import { toUniqueId } from "@blitzkit/core";
import { NodeIO } from "@gltf-transform/core";
import { extractArmor } from "../core/blitz/extractArmor";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";
import { VehicleDefinitionList } from "./definitions";

export async function tankArmors() {
  console.log("Building tank armors...");

  using uploader = new AssetUploader("tank armors");
  const nodeIO = new NodeIO();
  const nations = vfs.dir(`Data/XML/item_defs/vehicles`).filter((nation) => nation !== "common");

  for (const nation of nations) {
    const tanks = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`
    );

    for (const tankKey in tanks.root) {
      const tank = tanks.root[tankKey];

      if (tankKey.includes("tutorial_bot")) continue;

      const id = toUniqueId(nation, tank.id);
      const model = await extractArmor(vfs, `${nation}-${tankKey}`);
      const content = await nodeIO.writeBinary(model);

      await uploader.add({ path: `3d/tanks/armor/${id}.glb`, content });
    }
  }

  await uploader.flush();
}
