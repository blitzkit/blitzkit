import { MapDefinitions, sluggify } from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI3 } from "./3_modelDefinitions";

const MAP_MODES = ["domination", "supremacy"];

export abstract class ServerBlitzKitAPI4 extends ServerBlitzKitAPI3 {
  @Cache()
  async mapDefinitions() {
    const mapDefinitions = MapDefinitions.create();
    const modelIds = new Map<string, number>();
    const slugs = new Map<number, string>();
    const takenSlugs = new Set<string>();

    for (const key in this.mapsYaml!.maps) {
      const map = this.mapsYaml!.maps[key];
      const folder = map.localName.split("/")[0];

      modelIds.set(folder, Math.min(modelIds.get(folder) ?? Infinity, map.id));
    }

    const entries = Object.entries(this.mapsYaml!.maps).sort(
      ([, a], [, b]) => a.id - b.id,
    );

    for (const [key, map] of entries) {
      const modelId = modelIds.get(map.localName.split("/")[0])!;
      const name = this.getString(`#maps:${key}:${map.localName}`);

      name.locales[locales.default] ??= key;

      if (modelId === map.id) {
        let slug = sluggify(name.locales[locales.default]);

        if (takenSlugs.has(slug)) slug = `${slug}-${map.id}`;

        takenSlugs.add(slug);
        slugs.set(map.id, slug);
      }

      mapDefinitions.maps[map.id] = {
        id: map.id,
        name,
        model_id: modelId,
        slug: slugs.get(modelId)!,
        modes: map.availableModes,
        supremacy_points: map.supremacyPointsThreshold,
        training_room: map.avaliableInTrainingRoom,
      };
    }

    MAP_MODES.forEach((mode, id) => {
      mapDefinitions.modes[id] = {
        name: this.getString(`#arenas:type/${mode}/name`),
        description: this.getString(`#arenas:type/${mode}/description`),
      };
    });

    return mapDefinitions;
  }
}
