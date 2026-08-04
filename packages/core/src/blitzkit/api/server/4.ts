import { MapDefinitions } from "@blitzkit/core";
import { Cache } from "@blitzkit/core/src/blitzkit/api/server/0";
import { ServerBlitzKitAPI3 } from "@blitzkit/core/src/blitzkit/api/server/3";

export abstract class ServerBlitzKitAPI4 extends ServerBlitzKitAPI3 {
  @Cache()
  async mapDefinitions() {
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
