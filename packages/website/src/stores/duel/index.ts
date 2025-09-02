import {
  ModelDefinition,
  type EngineDefinition,
  type GunDefinition,
  type ShellDefinition,
  type TankDefinition,
  type TrackDefinition,
  type TurretDefinition,
} from "@blitzkit/core";
import { Varuna } from "varuna";
import { awaitableProvisionDefinitions } from "../../core/awaitables/provisionDefinitions";
import { tankToDuelMember } from "../../core/blitzkit/tankToDuelMember";

type EquipmentMatrixItem = -1 | 0 | 1;
type EquipmentMatrixRow = [
  EquipmentMatrixItem,
  EquipmentMatrixItem,
  EquipmentMatrixItem,
];
export type EquipmentMatrix = [
  EquipmentMatrixRow,
  EquipmentMatrixRow,
  EquipmentMatrixRow,
];

export interface DuelMember {
  tank: TankDefinition;
  engine: EngineDefinition;
  turret: TurretDefinition;
  gun: GunDefinition;
  shell: ShellDefinition;
  track: TrackDefinition;
  equipmentMatrix: EquipmentMatrix;
  consumables: number[];
  provisions: number[];
  camouflage: boolean;
  cooldownBooster: number;
  assaultDistance: number;
}

export interface DuelStore {
  protagonist: DuelMember;
  antagonist: DuelMember;
}

const provisionDefinitions = await awaitableProvisionDefinitions;

export const Duel = new Varuna<
  DuelStore,
  { tank: TankDefinition; model: ModelDefinition }
>(({ tank, model }) => {
  const protagonist = tankToDuelMember(tank, provisionDefinitions);

  return { protagonist, antagonist: protagonist, model };
});
