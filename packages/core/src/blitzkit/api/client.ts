import { fetchPB } from "../../protobuf";
import {
  CamouflageDefinitions,
  ConsumableDefinitions,
  GameDefinitions,
  ModelDefinitions,
  ProvisionDefinitions,
  TankDefinitions,
} from "../../protos";
import { BlitzKitAPI } from "./base";

export class ClientBlitzKitAPI extends BlitzKitAPI {
  gameDefinitions() {
    return fetchPB("/api/definitions/game.pb", GameDefinitions);
  }

  consumableDefinitions() {
    return fetchPB("/api/definitions/consumables.pb", ConsumableDefinitions);
  }

  tankDefinitions() {
    return fetchPB("/api/definitions/tanks.pb", TankDefinitions);
  }

  camouflageDefinitions() {
    return fetchPB("/api/definitions/camouflage.pb", CamouflageDefinitions);
  }

  provisionDefinitions() {
    return fetchPB("/api/definitions/provisions.pb", ProvisionDefinitions);
  }

  modelDefinitions() {
    return fetchPB("/api/definitions/models.pb", ModelDefinitions);
  }
}
