import { createDefaultEnvironment, type TankEnvironment } from "@blitzkit/core";
import type { TankDefinition } from "@blitzkit/protos";
import { Soapstone } from "soapstone";
import type { Vector3 } from "three";
import { api } from "../api/dynamic";
import type { ArmorType } from "../components/SpacedArmorScene";
import type { ExternalModuleVariant } from "../components/SpacedArmorSceneComponent";
import { createTankState } from "../tankopedia/createTankState";
import type { TankState } from "../tankopedia/tankState";
import { App } from "./app";
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
  penetrationChance?: number;

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
  ClassAndTier,
  Tier,
  All,
}

interface LoaderState<Type> {
  requested: Type;
  loaded: Type;
}

interface Tankopedia {
  disturbed: boolean;
  revealed: boolean;

  protagonist: TankState;
  antagonist: TankState;
  environment: TankEnvironment;

  relative_against: TankopediaRelativeAgainst;

  loaders: {
    display: LoaderState<TankopediaDisplay>;
    model: LoaderState<boolean>;
    skin: LoaderState<number | undefined>;
    attachment: LoaderState<number | undefined>;
  };

  // shot?: Shot;
  // editStatic: boolean;
  // highlightArmor?: {
  //   editingPlate: boolean;
  //   name: string;
  //   point: Vector3;
  //   thickness: number;
  //   color: string;
  // } & (
  //   | {
  //       type: ArmorType.Primary | ArmorType.Spaced;
  //       thicknessAngled: number;
  //       angle: number;
  //     }
  //   | { type: ArmorType.External }
  // );
  // xpMultiplier: (typeof XP_MULTIPLIERS)[number];
  // customShell?: ShellDefinition;
  // statSearch?: string;
}

const skills = await api.skills();

export const Tankopedia = new Soapstone<Tankopedia, [TankDefinition]>(
  (tank) => ({
    disturbed: false,
    revealed: false,

    protagonist: createTankState(tank),
    antagonist: createTankState(tank),
    environment: createDefaultEnvironment(skills),

    relative_against: TankopediaRelativeAgainst.ClassAndTier,

    loaders: {
      display: {
        requested: TankopediaDisplay.Model,
        loaded: TankopediaDisplay.Model,
      },
      model: { requested: App.state.autoLoadModels, loaded: false },
      skin: { requested: undefined, loaded: undefined },
      attachment: { requested: undefined, loaded: undefined },
    },

    editStatic: false,
    xpMultiplier: 1,
  }),
);
