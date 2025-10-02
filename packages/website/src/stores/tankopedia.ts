import {
  createDefaultSkills,
  ShellDefinition,
  type ModelDefinition,
} from "@blitzkit/core";
import type { Vector3 } from "three";
import { Varuna } from "varuna";
import type { ArmorType } from "../components/Armor/components/SpacedArmorScene";
import type { ExternalModuleVariant } from "../components/Armor/components/SpacedArmorSceneComponent";
import type { XP_MULTIPLIERS } from "../components/Tankopedia/TechTreeSection";
import { awaitableSkillDefinitions } from "../core/awaitables/skillDefinitions";
import { TankopediaDisplay } from "./tankopediaPersistent/constants";

export interface ShotLayerBase {
  index: number;
  thickness: number;
  point: Vector3;
  surfaceNormal: Vector3;
  status: "blocked" | "penetration" | "ricochet";
}

interface ShotLayerExternal extends ShotLayerBase {
  type: ArmorType.External;
  variant: ExternalModuleVariant;
}

export interface ShotLayerNonExternal extends ShotLayerBase {
  type: Exclude<ArmorType, ArmorType.External>;
  angle: number;
  thicknessAngled: number;
}

export interface ShotLayerGap {
  type: null;
  status: "penetration" | "blocked";
  distance: number;
}

export type ShotLayer = ShotLayerExternal | ShotLayerNonExternal | ShotLayerGap;

export type Shot = {
  containsGaps: boolean;
  damage: number;
  splashRadius?: number;

  in: {
    surfaceNormal: Vector3;
    status: ShotStatus;
    layers: ShotLayer[];
  };
  out?: {
    surfaceNormal: Vector3;
    status: ShotStatus;
    layers: ShotLayer[];
  };
};

export type ShotStatus = "penetration" | "blocked" | "ricochet" | "splash";

export type ArmorPiercingLayer =
  | {
      distance: number;
      nominal: number;
      angled: number;
      ricochet: boolean;
      type: "core" | "spaced" | "external";
    }
  | {
      type: "gap";
      gap: number;
    };

export enum TankopediaRelativeAgainst {
  Class,
  Tier,
  All,
}

interface Tankopedia {
  disturbed: boolean;
  revealed: boolean;
  shot?: Shot;
  skills: Record<string, number>;
  relativeAgainst: TankopediaRelativeAgainst;
  model: ModelDefinition;
  editStatic: boolean;
  highlightArmor?: {
    editingPlate: boolean;
    name: string;
    point: Vector3;
    thickness: number;
    color: string;
  } & (
    | {
        type: ArmorType.Primary | ArmorType.Spaced;
        thicknessAngled: number;
        angle: number;
      }
    | { type: ArmorType.External }
  );
  xpMultiplier: (typeof XP_MULTIPLIERS)[number];
  customShell?: ShellDefinition;
  display: TankopediaDisplay;
  statSearch?: string;
}

const skillDefinitions = await awaitableSkillDefinitions;

export const Tankopedia = new Varuna<Tankopedia, ModelDefinition>((model) => ({
  disturbed: false,
  revealed: false,
  relativeAgainst: TankopediaRelativeAgainst.Class,
  editStatic: false,
  skills: createDefaultSkills(skillDefinitions),
  model,
  xpMultiplier: 1,
  display: TankopediaDisplay.Model,
}));
