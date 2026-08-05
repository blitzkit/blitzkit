import { fetchPB } from "../../protobuf";
import {
  CamouflageDefinitions,
  ConsumableDefinitions,
  EquipmentDefinitions,
  GameDefinitions,
  ModelDefinitions,
  ProvisionDefinitions,
  SkillDefinitions,
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

  skillDefinitions() {
    return fetchPB("/api/definitions/skills.pb", SkillDefinitions);
  }

  equipmentDefinitions() {
    return fetchPB("/api/definitions/equipment.pb", EquipmentDefinitions);
  }
}
