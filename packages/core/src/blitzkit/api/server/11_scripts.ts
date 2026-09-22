import { ConsumablesCommon, OptionalDevices } from "../../../types";
import { BlitzScripts } from "../../../types/blitzScripts";
import { AbstractVFS } from "../../vfs";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI10 } from "./10_avatars";

export abstract class ServerBlitzKitAPI11 extends ServerBlitzKitAPI10 {
  @Cache()
  async scripts() {
    const scripts: BlitzScripts = {
      consumables: {},
      equipment: {},
      provisions: {},
    };

    const optionalDevices = await this.vfs.xml<{
      root: OptionalDevices;
    }>("Data/XML/item_defs/vehicles/common/optional_devices.xml");

    for (const key in optionalDevices.root) {
      const equipment = optionalDevices.root[key];
      scripts.equipment[equipment.id] = equipment.script;
    }

    async function assign(
      vfs: AbstractVFS,
      dir: string,
      target: keyof BlitzScripts,
    ) {
      const root = `Data/XML/item_defs/vehicles/common/${dir}`;
      const list = await vfs.text(`${root}/list.xml`);
      const pattern = /<items path="(\w+)\.xml"\/>/gm;

      for (const match of list.matchAll(pattern)) {
        const group = match[1];
        const path = `${root}/${group}.xml`;
        const things = await vfs.xml<{ root: ConsumablesCommon }>(path);

        for (const key in things.root) {
          const thing = things.root[key];
          scripts[target][thing.id] = things.root[key].script;
        }
      }
    }

    await assign(this.vfs, "consumables", "consumables");
    await assign(this.vfs, "provisions", "provisions");

    return scripts;
  }
}
