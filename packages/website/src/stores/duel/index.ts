import {
  ModelDefinition,
  type EngineDefinition,
  type GunDefinition,
  type ProvisionDefinitions,
  type ShellDefinition,
  type TankDefinition,
  type TrackDefinition,
  type TurretDefinition,
} from '@blitzkit/core';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { tankToDuelMember } from '../../core/blitzkit/tankToDuelMember';
import { createContextualStore } from '../../core/zustand/createContextualStore';

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

export const Duel = createContextualStore(
  ({
    tank,
    model,
    provisionDefinitions,
  }: {
    tank: TankDefinition;
    model: ModelDefinition;
    provisionDefinitions: ProvisionDefinitions;
  }) => {
    const protagonist = tankToDuelMember(tank, provisionDefinitions);

    return create<DuelStore>()(
      subscribeWithSelector<DuelStore>(() => ({
        protagonist,
        model,
        antagonist: protagonist,
      })),
    );
  },
);
