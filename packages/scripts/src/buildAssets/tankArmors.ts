import { toUniqueId } from "@blitzkit/core";
import { NodeIO } from "@gltf-transform/core";
import { readdir } from "fs/promises";
import { extractArmor } from "../core/blitz/extractArmor";
import { readXMLDVPL } from "../core/blitz/readXMLDVPL";
import { AssetUploader } from "../core/github/assetUploader";
import { DATA } from "./constants";
import { VehicleDefinitionList } from "./definitions";

export async function tankArmors() {
  console.log("Building tank armors...");

  using uploader = new AssetUploader("tank armors");
  const nodeIO = new NodeIO();
  const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
    (nations) => nations.filter((nation) => nation !== "common")
  );

  for (const nation of nations) {
    const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
      `${DATA}/XML/item_defs/vehicles/${nation}/list.xml`
    );

    for (const tankKey in tanks.root) {
      const tank = tanks.root[tankKey];

      if (tankKey.includes("tutorial_bot")) continue;

      const id = toUniqueId(nation, tank.id);
      const model = await extractArmor(DATA, `${nation}-${tankKey}`);
      const content = await nodeIO.writeBinary(model);

      await uploader.add({ path: `3d/tanks/armor/${id}.glb`, content });
    }
  }

  await uploader.flush();
}
