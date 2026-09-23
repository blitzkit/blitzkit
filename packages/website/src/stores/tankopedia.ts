import {
  createDefaultSkills,
  ShellDefinition,
  TankDefinition,
} from "@blitzkit/core";
import type { Vector3 } from "three";
import { Varuna } from "varuna";
import { api } from "../blitzkit/api";
import type { ArmorType } from "../components/Armor/components/SpacedArmorScene";
import type { ExternalModuleVariant } from "../components/Armor/components/SpacedArmorSceneComponent";
import type { XP_MULTIPLIERS } from "../components/Tankopedia/TechTreeSection";
import { createTankState } from "../tankopedia/createTankState";
import type { TankState } from "../tankopedia/tankState";
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

  protagonist: TankState;

  shot?: Shot;
  skills: Record<string, number>;
  relativeAgainst: TankopediaRelativeAgainst;
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
  requestedDisplay: TankopediaDisplay;
  display: TankopediaDisplay;
  statSearch?: string;
}

const skills = await api.skills();
const models = await api.models();

export const Tankopedia = new Varuna<Tankopedia, TankDefinition>((tank) => ({
  disturbed: false,
  revealed: false,

  protagonist: createTankState(tank),
  model: models.models[tank.id],

  relativeAgainst: TankopediaRelativeAgainst.Class,
  editStatic: false,
  skills: createDefaultSkills(skills),
  xpMultiplier: 1,
  requestedDisplay: TankopediaDisplay.Model,
  display: TankopediaDisplay.Model,
}));
