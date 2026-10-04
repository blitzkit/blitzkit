import type { Strings } from "@blitzkit/i18n";
import type {
  EngineDefinition,
  Equalizer,
  GunDefinition,
  ShellDefinition,
  TankDefinition,
  TrackDefinition,
  TurretDefinition,
} from "@blitzkit/protos";
import type { ReactNode } from "react";
import { characteristics } from "../config/characteristics";
import type { TankEnvironment } from "../stores/tankopedia";
import type { TankState } from "../tankopedia/tankState";

export type Characteristic = {
  should_render?(context: CharacteristicContext): boolean;
} & (
  | {
      type: CharacteristicType.Enum;
      compute(context: CharacteristicContext): string;
    }
  | {
      type: CharacteristicType.Number;
      compute(context: CharacteristicContext): number;
    }
);

export interface CharacteristicContext {
  state: TankState;
  environment: TankEnvironment;

  equalizer: Equalizer;

  tank: TankDefinition;
  engine: EngineDefinition;
  track: TrackDefinition;
  turret: TurretDefinition;
  gun: GunDefinition;
  shell: ShellDefinition;

  characteristic(
    name: CharacteristicName,
  ): ReturnType<Characteristic["compute"]>;
}

export enum CharacteristicType {
  Enum,
  Number,
}

export type CharacteristicName = keyof typeof characteristics;
export type CharacteristicReturnType = ReturnType<Characteristic["compute"]>;

export type ComputedCharacteristics = Map<
  CharacteristicName,
  CharacteristicReturnType
>;

export interface CharacteristicRenderConfig {
  name: CharacteristicName;

  decimals?: number;
  units?: keyof Strings["units"];
  localize?: boolean;
  strings?: string;

  render?: (data: {
    output: CharacteristicReturnType;
    strings: Strings;
  }) => ReactNode;
}

export interface ToyRenderConfig {
  toy: string;
}

export type CharacteristicsGroup = {
  name: string;
  order: (CharacteristicRenderConfig | ToyRenderConfig)[];
};
