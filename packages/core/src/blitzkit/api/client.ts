import { alias } from "@blitzkit/core";
import { fetchPB } from "../../protobuf";
import {
  CamouflageDefinitions,
  ConsumableDefinitions,
  EquipmentDefinitions,
  Gallery,
  GameDefinitions,
  MapDefinitions,
  ModelDefinitions,
  ProvisionDefinitions,
  SkillDefinitions,
  TankDefinitions,
} from "../../protos";
import { BlitzKitAPI } from "./base";

export class ClientBlitzKitAPI extends BlitzKitAPI {
  game() {
    return fetchPB(alias("api", "/definitions/game.pb"), GameDefinitions);
  }

  consumables() {
    return fetchPB(
      alias("api", "/definitions/consumables.pb"),
      ConsumableDefinitions,
    );
  }

  tanks() {
    return fetchPB(alias("api", "/definitions/tanks.pb"), TankDefinitions);
  }

  camouflages() {
    return fetchPB(
      alias("api", "/definitions/camouflage.pb"),
      CamouflageDefinitions,
    );
  }

  provisions() {
    return fetchPB(
      alias("api", "/definitions/provisions.pb"),
      ProvisionDefinitions,
    );
  }

  models() {
    return fetchPB(alias("api", "/definitions/models.pb"), ModelDefinitions);
  }

  skills() {
    return fetchPB(alias("api", "/definitions/skills.pb"), SkillDefinitions);
  }

  equipments() {
    return fetchPB(
      alias("api", "/definitions/equipment.pb"),
      EquipmentDefinitions,
    );
  }

  gallery() {
    return fetchPB(alias("api", "/definitions/gallery.pb"), Gallery);
  }

  maps() {
    return fetchPB(alias("api", "/definitions/maps.pb"), MapDefinitions);
  }
}
