import { MapDefinitions } from "@blitzkit/core";
import { Cache } from "./0_base";
import { ServerBlitzKitAPI3 } from "./3_models";

export abstract class ServerBlitzKitAPI4 extends ServerBlitzKitAPI3 {
  @Cache()
  async maps() {
    const mapDefinitions = MapDefinitions.create();

    for (const key in this.mapsYaml!.maps) {
      const map = this.mapsYaml!.maps[key];

      mapDefinitions.maps[map.id] = {
        id: map.id,
        name: this.getString(`#maps:${key}:${map.localName}`),
      };
    }

    return mapDefinitions;
  }
}
