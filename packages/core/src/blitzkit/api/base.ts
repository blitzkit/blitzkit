import {
  CamouflageDefinitions,
  ConsumableDefinitions,
  EquipmentDefinitions,
  GameDefinitions,
  MapDefinitions,
  ModelDefinitions,
  ProvisionDefinitions,
  SkillDefinitions,
  TankDefinitions,
} from "@blitzkit/core";

export abstract class BlitzKitAPI {
  abstract skillDefinitions(): Promise<SkillDefinitions>;
  abstract provisionDefinitions(): Promise<ProvisionDefinitions>;
  abstract consumableDefinitions(): Promise<ConsumableDefinitions>;
  abstract equipmentDefinitions(): Promise<EquipmentDefinitions>;
  abstract mapDefinitions(): Promise<MapDefinitions>;
  abstract modelDefinitions(): Promise<ModelDefinitions>;
  abstract camouflageDefinitions(): Promise<CamouflageDefinitions>;
  abstract tankDefinitions(): Promise<TankDefinitions>;
  abstract gameDefinitions(): Promise<GameDefinitions>;
}
