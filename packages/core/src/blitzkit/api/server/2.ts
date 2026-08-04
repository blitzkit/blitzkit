import { CamouflageDefinitions } from "@blitzkit/core";
import { Cache } from "@blitzkit/core/src/blitzkit/api/server/0";
import { ServerBlitzKitAPI1 } from "@blitzkit/core/src/blitzkit/api/server/1";

export abstract class ServerBlitzKitAPI2 extends ServerBlitzKitAPI1 {
  @Cache()
  async camouflageDefinitions() {
    const camouflageDefinitions = CamouflageDefinitions.create();

    for (const camoKey in this.camouflagesXml!.root.camouflages) {
      const camo = this.camouflagesXml!.root.camouflages[camoKey];

      const yamlEntry = this.camouflagesYaml![camoKey];
      const fullName = yamlEntry.userString
        ? this.getString(yamlEntry.userString)
        : undefined;
      const shortName = yamlEntry.shortUserString
        ? this.getString(yamlEntry.shortUserString)
        : undefined;
      const resolvedTankName = shortName ?? fullName;
      const resolvedTankNameFull =
        resolvedTankName === fullName ? undefined : fullName;

      camouflageDefinitions.camouflages[camo.id] = {
        id: camo.id,
        name: this.getString(camo.userString),
        tank_name: resolvedTankName,
        tank_name_full: resolvedTankNameFull,
      };
    }

    return camouflageDefinitions;
  }
}
