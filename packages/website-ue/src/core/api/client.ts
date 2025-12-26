import { fetchPB } from "@blitzkit/core";
import { Tank } from "../../protos/tank";
import { TankList } from "../../protos/tank_list";
import { Tanks } from "../../protos/tanks";
import { AbstractAPI } from "./abstract";

export class ClientAPI extends AbstractAPI {
  tanks() {
    return fetchPB("/api/tanks.pb", Tanks);
  }

  tankList() {
    return fetchPB("/api/tanks/list.pb", TankList);
  }

  tank(id: string) {
    return fetchPB(`/api/tanks/${id}.pb`, Tank);
  }
}
