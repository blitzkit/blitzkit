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
} from "@blitzkit/core";
import { Strings } from "@blitzkit/i18n";
import { BlitzScripts } from "../../types/blitzScripts";

export abstract class AbstractBlitzKitAPI {
  abstract skills(): Promise<SkillDefinitions>;
  abstract provisions(): Promise<ProvisionDefinitions>;
  abstract consumables(): Promise<ConsumableDefinitions>;
  abstract equipment(): Promise<EquipmentDefinitions>;
  abstract maps(): Promise<MapDefinitions>;
  abstract models(): Promise<ModelDefinitions>;
  abstract camouflages(): Promise<CamouflageDefinitions>;
  abstract tanks(): Promise<TankDefinitions>;
  abstract game(): Promise<GameDefinitions>;
  abstract gallery(): Promise<Gallery>;
  abstract scripts(): Promise<BlitzScripts>;

  abstract strings(locale: string): Promise<Strings>;

  async tank(id: number) {
    const tanks = await this.tanks();
    return tanks.tanks[id];
  }

  async model(id: number) {
    const models = await this.models();
    return models.models[id];
  }
}
