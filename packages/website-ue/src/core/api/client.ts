import { TankCatalogComponent } from "@protos/blitz_static_tank_component";
import { AbstractAPI } from "./abstract";

export class ClientAPI extends AbstractAPI {
  async tank(id: string) {
    const response = await fetch(`/api/tanks/${id}.pb`);
    const buffer = await response.arrayBuffer();
    const array = new Uint8Array(buffer);

    return TankCatalogComponent.decode(array);
  }
}
