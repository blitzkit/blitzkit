import type {
  BlitzEffectScript,
  BlitzScripts,
  ConsumablesCommon,
  OptionalDevices,
} from "../../../types";
import type { AbstractVFS } from "@blitzkit/vfs";
import { Cache } from "../cache";
import { ServerBlitzKitAPI10 } from "./10_avatars";

export abstract class ServerBlitzKitAPI11 extends ServerBlitzKitAPI10 {
  // The XML parser keeps switches as text, but the script types declare them as
  // booleans
  private normalizeSwitches<Value>(value: Value): Value {
    if (typeof value === "string") {
      const lowered = value.toLowerCase();

      if (lowered === "true") return true as Value;
      if (lowered === "false") return false as Value;
    }

    if (Array.isArray(value))
      return value.map((child) => this.normalizeSwitches(child)) as Value;

    if (typeof value === "object" && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          this.normalizeSwitches(child),
        ]),
      ) as Value;
    }

    return value;
  }

  private assignNormalizedScript(
    target: Record<number, BlitzEffectScript>,
    key: number,
    script?: BlitzEffectScript,
  ) {
    if (script === undefined) return;

    if (script["#text"] === "StaticFactorDevice") {
      script["#text"] = script.attribute!;
    }

    target[key] = this.normalizeSwitches(script);
  }

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

      this.assignNormalizedScript(
        scripts.equipment,
        equipment.id,
        equipment.script,
      );
    }

    const assign = async (
      vfs: AbstractVFS,
      dir: string,
      target: "consumables" | "provisions",
    ) => {
      const root = `Data/XML/item_defs/vehicles/common/${dir}`;
      const list = await vfs.text(`${root}/list.xml`);
      const pattern = /<items path="(\w+)\.xml"\/>/gm;

      for (const match of list.matchAll(pattern)) {
        const group = match[1];
        const path = `${root}/${group}.xml`;
        const things = await vfs.xml<{ root: ConsumablesCommon }>(path);

        for (const key in things.root) {
          const thing = things.root[key];

          this.assignNormalizedScript(
            scripts[target],
            thing.id,
            things.root[key].script,
          );
        }
      }
    };

    await assign(this.vfs, "consumables", "consumables");
    await assign(this.vfs, "provisions", "provisions");

    return scripts;
  }
}
