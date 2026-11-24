import { alias } from "@blitzkit/core";
import { Strings } from "@blitzkit/i18n";
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
import { Cache } from "./cache";

export class ClientBlitzKitAPI extends AbstractBlitzKitAPI {
  @Cache()
  game() {
    return fetchPB(alias("api", "/definitions/game.pb"), GameDefinitions);
  }

  @Cache()
  consumables() {
    return fetchPB(
      alias("api", "/definitions/consumables.pb"),
      ConsumableDefinitions,
    );
  }

  @Cache()
  tanks() {
    return fetchPB(alias("api", "/definitions/tanks.pb"), TankDefinitions);
  }

  @Cache()
  camouflages() {
    return fetchPB(
      alias("api", "/definitions/camouflage.pb"),
      CamouflageDefinitions,
    );
  }

  @Cache()
  provisions() {
    return fetchPB(
      alias("api", "/definitions/provisions.pb"),
      ProvisionDefinitions,
    );
  }

  @Cache()
  models() {
    return fetchPB(alias("api", "/definitions/models.pb"), ModelDefinitions);
  }

  @Cache()
  skills() {
    return fetchPB(alias("api", "/definitions/skills.pb"), SkillDefinitions);
  }

  @Cache()
  equipment() {
    return fetchPB(
      alias("api", "/definitions/equipment.pb"),
      EquipmentDefinitions,
    );
  }

  @Cache()
  gallery() {
    return fetchPB(alias("api", "/definitions/gallery.pb"), Gallery);
  }

  @Cache()
  maps() {
    return fetchPB(alias("api", "/definitions/maps.pb"), MapDefinitions);
  }

  @Cache()
  scripts() {
    return fetchJSON<BlitzScripts>(alias("api", "/definitions/scripts.json"));
  }

  @Cache()
  strings(locale: string) {
    return fetchJSON<Strings>(alias("api", `/strings/${locale}.json`));
  }
}
