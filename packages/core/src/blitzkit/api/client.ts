import { alias } from "@blitzkit/core";
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
} from "@blitzkit/protos";
import { fetchPB } from "../../protobuf";
import { BlitzScripts } from "../../types/blitzScripts";
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

  equipment() {
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

  async scripts() {
    const response = await fetch(alias("api", "/definitions/scripts.json"));
    const json = await response.json();
    return json as BlitzScripts;
  }
}
