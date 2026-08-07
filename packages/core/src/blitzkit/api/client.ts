import { alias } from "@blitzkit/core";
import { fetchPB } from "../../protobuf";
import {
  CamouflageDefinitions,
  ConsumableDefinitions,
  EquipmentDefinitions,
  Gallery,
  GameDefinitions,
  ModelDefinitions,
  ProvisionDefinitions,
  SkillDefinitions,
  TankDefinitions,
} from "../../protos";
import { BlitzKitAPI } from "./base";

export class ClientBlitzKitAPI extends BlitzKitAPI {
  gameDefinitions() {
    return fetchPB(alias("api", "/definitions/game.pb"), GameDefinitions);
  }

  consumableDefinitions() {
    return fetchPB(
      alias("api", "/definitions/consumables.pb"),
      ConsumableDefinitions,
    );
  }

  tankDefinitions() {
    return fetchPB(alias("api", "/definitions/tanks.pb"), TankDefinitions);
  }

  camouflageDefinitions() {
    return fetchPB(
      alias("api", "/definitions/camouflage.pb"),
      CamouflageDefinitions,
    );
  }

  provisionDefinitions() {
    return fetchPB(
      alias("api", "/definitions/provisions.pb"),
      ProvisionDefinitions,
    );
  }

  modelDefinitions() {
    return fetchPB(alias("api", "/definitions/models.pb"), ModelDefinitions);
  }

  skillDefinitions() {
    return fetchPB(alias("api", "/definitions/skills.pb"), SkillDefinitions);
  }

  equipmentDefinitions() {
    return fetchPB(
      alias("api", "/definitions/equipment.pb"),
      EquipmentDefinitions,
    );
  }

  galleryDefinitions() {
    return fetchPB(alias("api", "/definitions/gallery.pb"), Gallery);
  }
}
