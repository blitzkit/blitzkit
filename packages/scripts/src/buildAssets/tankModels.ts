import { toUniqueId } from "@blitzkit/core";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { extractModel } from "../core/blitz/extractModel";
import { AssetUploader } from "../core/github/assetUploader";
import { vfs } from "./constants";
import { VehicleDefinitionList } from "./definitions";
import { TankParameters } from "./tankIcons";

export async function tankModels() {
  console.log("Building tank models...");

  using uploader = new AssetUploader("tank models");
  const nodeIO = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const nations = vfs.dir(`Data/XML/item_defs/vehicles`).filter((nation) => nation !== "common")

  for (const nationIndex in nations) {
    const nation = nations[nationIndex];
    const tanks = await vfs.xml<{ root: VehicleDefinitionList }>(
      `Data/XML/item_defs/vehicles/${nation}/list.xml`
    );
    const entries = Object.entries(tanks.root);

    for (const [tankKey, tank] of entries) {
      if (tankKey.includes("tutorial_bot")) continue;

      const id = toUniqueId(nation, tank.id);
      const parameters = await vfs.yaml<TankParameters>(
        `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`
      );
      const model = await extractModel(
        vfs,
        parameters.resourcesPath.blitzModelPath.replace(/\.sc2$/, "")
      );
      const content = Buffer.from(await nodeIO.writeBinary(model));

      await uploader.add({ path: `3d/tanks/models/${id}.glb`, content });
    }
  }

  await uploader.flush();
}
