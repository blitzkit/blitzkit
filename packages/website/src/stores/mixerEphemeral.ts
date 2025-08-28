import type {
  GunDefinition,
  TankDefinition,
  TurretDefinition,
} from '@blitzkit/core';
import { create } from 'zustand';
import { createContextualStore } from '../core/zustand/createContextualStore';

export interface MixerEphemeral {
  hull: TankDefinition;
  turret: {
    tank: TankDefinition;
    turret: TurretDefinition;
  };
  gun: {
    tank: TankDefinition;
    turret: TurretDefinition;
    gun: GunDefinition;
  };
}

export const MixerEphemeral = createContextualStore((data: MixerEphemeral) =>
  create<MixerEphemeral>()(() => data),
);
