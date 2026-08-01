import { fetchPB } from "../../protobuf";
import { GameDefinitions } from "../../protos";
import { BlitzKitAPI } from "./base";

export class ClientBlitzKitAPI extends BlitzKitAPI {
  game() {
    return fetchPB("/api/definitions/game.pb", GameDefinitions);
  }
}
