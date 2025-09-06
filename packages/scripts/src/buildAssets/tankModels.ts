import { toUniqueId } from "@blitzkit/core";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { readdir } from "fs/promises";
import { extractModel } from "../core/blitz/extractModel";
import { readXMLDVPL } from "../core/blitz/readXMLDVPL";
import { readYAMLDVPL } from "../core/blitz/readYAMLDVPL";
import { commitAssets } from "../core/github/commitAssets";
import { FileChange } from "../core/github/commitMultipleFiles";
import { DATA } from "./constants";
import { VehicleDefinitionList } from "./definitions";
import { TankParameters } from "./tankIcons";

export async function tankModels() {
  console.log("Building tank models...");

  const nodeIO = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
    (nations) => nations.filter((nation) => nation !== "common")
  );

  for (const nationIndex in nations) {
    const nation = nations[nationIndex];
    const changes: FileChange[] = [];
    const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
      `${DATA}/XML/item_defs/vehicles/${nation}/list.xml`
    );
    const entries = Object.entries(tanks.root);

    console.log(`Building models for ${nation}`);

    let index = 0;
    for (const [tankKey, tank] of entries) {
      console.log(`  ${++index} / ${entries.length} : ${tankKey}`);

      if (tankKey.includes("tutorial_bot")) continue;

      const id = toUniqueId(nation, tank.id);

      const parameters = await readYAMLDVPL<TankParameters>(
        `${DATA}/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`
      );
      const model = await extractModel(
        DATA,
        parameters.resourcesPath.blitzModelPath.replace(/\.sc2$/, "")
      );
      const content = Buffer.from(await nodeIO.writeBinary(model));

      changes.push({ path: `3d/tanks/models/${id}.glb`, content });
    }

    await commitAssets(`tank models ${nation}`, changes);
  }
}
