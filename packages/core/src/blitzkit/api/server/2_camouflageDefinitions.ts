import {
  CamouflageDefinitions,
  Sc2ReadStream,
  type TankParameters,
} from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import { isEqual, times } from "lodash-es";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI1 } from "./1_tankDefinitions";

export abstract class ServerBlitzKitAPI2 extends ServerBlitzKitAPI1 {
  private async skinPresets(vehicle: string) {
    const [nation, tankKey] = vehicle.split(":");
    const parameters = await this.vfs.yaml<TankParameters>(
      `Data/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
    );
    const sc2 = new Sc2ReadStream(
      (
        await this.vfs.file(
          `Data/3d/${parameters.resourcesPath.blitzModelPath}`,
        )
      ).buffer as ArrayBuffer,
    ).sc2();
    const presets = new Set<string>();

    for (const node of sc2["#dataNodes"]) {
      if (typeof node.configCount !== "number") continue;

      times(node.configCount, (index) => node[`configArchive_${index}`])
        .filter(
          (archive) =>
            !isEqual(archive.textures, node.configArchive_0.textures),
        )
        .forEach((archive) => presets.add(archive.configName));
    }

    return presets;
  }

  @Cache()
  async camouflageDefinitions() {
    const camouflageDefinitions = CamouflageDefinitions.create();
    const customization = await this.vfs.yaml<
      Record<string, { Name: string; Path: string }>
    >("Data/3d/Customization.yaml");
    const items = new Map(
      Object.values(customization).map(({ Name, Path }) => [
        Name,
        Path.replace("~res:/", "Data/").replace(/\.sc2$/, ""),
      ]),
    );
    const skinPresets = new Map<string, Promise<Set<string>>>();

    for (const camoKey in this.camouflagesXml!.root.camouflages) {
      const camo = this.camouflagesXml!.root.camouflages[camoKey];

      if (!(camoKey in this.camouflagesYaml!)) continue;

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
      const include = camo.vehicleFilter.include;
      const vehicle =
        include && !Array.isArray(include) && "vehicle" in include
          ? include.vehicle?.name
          : undefined;
      let tankId: number | undefined = undefined;

      if (vehicle && vehicle in this.tankStringIdMap) {
        const resolvedParts = await Promise.all(
          Object.values(yamlEntry.customEntities ?? {}).map(
            async ({ item }) => {
              const path = items.get(item);

              return (
                path !== undefined &&
                (await this.vfs.resolve(`${path}.sc2`)) &&
                (await this.vfs.resolve(`${path}.scg`))
              );
            },
          ),
        );

        const [nation, tankKey] = vehicle.split(":");
        // some unique camos only set the preset for their one tank
        const preset =
          yamlEntry.preset ??
          yamlEntry.override?.[nation]?.override?.[tankKey]?.preset;
        let hasPreset = false;

        if (preset !== undefined) {
          if (!skinPresets.has(vehicle)) {
            skinPresets.set(vehicle, this.skinPresets(vehicle));
          }

          hasPreset = (await skinPresets.get(vehicle)!).has(preset);
        }

        if (resolvedParts.some(Boolean) || hasPreset) {
          tankId = this.tankStringIdMap[vehicle];
        }
      }

      // unreleased camos are in the game files before their names
      const name =
        camo.userString in this.stringsI18n[locales.default]
          ? this.getString(camo.userString)
          : undefined;

      camouflageDefinitions.camouflages[camo.id] = {
        id: camo.id,
        name,
        tank_name: resolvedTankName,
        tank_name_full: resolvedTankNameFull,
        tank_id: tankId,
        attachment: camo.kind === "customization",
      };
    }

    return camouflageDefinitions;
  }
}
