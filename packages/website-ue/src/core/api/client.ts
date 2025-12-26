import { Tank } from "../../protos/tank";
import { AbstractAPI } from "./abstract";

export class ClientAPI extends AbstractAPI {
  async tank(id: string) {
    const response = await fetch(`/api/tanks/${id}.pb`);
    const buffer = await response.arrayBuffer();
    const array = new Uint8Array(buffer);

    return Tank.decode(array);
  }
}
