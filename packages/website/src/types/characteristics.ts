import type { Strings } from "@blitzkit/i18n";
import type {
  Equalizer,
  GunDefinition,
  ShellDefinition,
} from "@blitzkit/protos";
import type { ReactNode } from "react";
import { characteristics } from "../config/characteristics";

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

interface CharacteristicContext {
  gun: GunDefinition;
  shell: ShellDefinition;

  equalizer: Equalizer;

  assault_distance: number;

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

export type ComputedCharacteristics = Partial<
  Record<CharacteristicName, CharacteristicReturnType>
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
