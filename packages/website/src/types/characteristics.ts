import type { Equalizer, GunDefinition, ShellDefinition } from "@blitzkit/core";
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

type CharacteristicName = keyof typeof characteristics;
type CharacteristicReturnType = ReturnType<Characteristic["compute"]>;

export type ComputedCharacteristics = Record<
  CharacteristicName,
  CharacteristicReturnType
>;
