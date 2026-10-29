import type { TankEnvironment } from "@blitzkit/core";
import type { BlitzEffectScript } from "@blitzkit/core/src/types/blitzEffectScript";
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
import type { characteristics } from "../config/characteristics";
import type { toys } from "../config/toys";
import type { DuelSide } from "../hooks/useEquipment";
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
  | {
      type: CharacteristicType.NumberList;
      compute(context: CharacteristicContext): number[];
    }
);

export type CharacteristicScript = (
  side: DuelSide,
  name: string,
  effect: (effect: BlitzEffectScript) => void,
) => void;

export interface CharacteristicContext {
  state: TankState;
  environment: TankEnvironment;

  equalizer: Equalizer;

  progressive(role: CrewStatRole): number;
  degressive(role: CrewStatRole): number;

  tank: TankDefinition;
  engine: EngineDefinition;
  track: TrackDefinition;
  turret: TurretDefinition;
  gun: GunDefinition;
  shell: ShellDefinition;

  characteristic(
    name: CharacteristicName,
  ): ReturnType<Characteristic["compute"]>;

  script: CharacteristicScript;
}

export type CrewStatRole = "commander" | "loader" | "gunner" | "driver";

export enum CharacteristicType {
  Enum,
  Number,
  NumberList,
}

export enum CharacteristicRanking {
  HigherIsBetter,
  LowerIsBetter,
  None,
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
  indent?: boolean;
  ranking?: CharacteristicRanking;
  strings?: string;

  render?: (data: {
    output: CharacteristicReturnType;
    strings: Strings;
  }) => ReactNode;
}

export interface ToyRenderConfig {
  toy: string;
}

export interface LabelRenderConfig {
  label: ToyName;
}

export type ToyName = keyof typeof toys;

export type CharacteristicsGroup = {
  name: string;
  order: (CharacteristicRenderConfig | LabelRenderConfig | ToyRenderConfig)[];
};
