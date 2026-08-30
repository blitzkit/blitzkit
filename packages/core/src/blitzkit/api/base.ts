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

export abstract class BlitzKitAPI {
  abstract skills(): Promise<SkillDefinitions>;
  abstract provisions(): Promise<ProvisionDefinitions>;
  abstract consumables(): Promise<ConsumableDefinitions>;
  abstract equipments(): Promise<EquipmentDefinitions>;
  abstract maps(): Promise<MapDefinitions>;
  abstract models(): Promise<ModelDefinitions>;
  abstract camouflages(): Promise<CamouflageDefinitions>;
  abstract tanks(): Promise<TankDefinitions>;
  abstract game(): Promise<GameDefinitions>;
  abstract gallery(): Promise<Gallery>;

  async tank(id: number) {
    const tanks = await this.tanks();
    return tanks.tanks[id];
  }
}
