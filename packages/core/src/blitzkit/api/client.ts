import { alias } from "@blitzkit/core";
import { BlitzKitStrings } from "@blitzkit/i18n";
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
import { fetchPB } from "../../api";
import { fetchJSON } from "../../api/fetchJSON";
import { BlitzScripts } from "../../types/blitzScripts";
import { AbstractBlitzKitAPI } from "./abstract";

export class ClientBlitzKitAPI extends AbstractBlitzKitAPI {
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

  scripts() {
    return fetchJSON<BlitzScripts>(alias("api", "/definitions/scripts.json"));
  }

  strings(locale: string) {
    return fetchJSON<BlitzKitStrings>(alias("api", `/strings/${locale}.json`));
  }
}
