import type { TankDefinition } from "@blitzkit/core";
import { api } from "./api";

const tankDefinitions = await api.tankDefinitions();

const ids = Object.keys(tankDefinitions.tanks);

export const MAX_GUESSES = 8;

export function randomTank() {
  const id = Number(ids[Math.floor(Math.random() * ids.length)]);
  return tankDefinitions.tanks[id];
}

export enum ClueResult {
  Correct,
  Incorrect,
  Higher,
  Lower,
}

export const clueKeys = [
  "tier",
  "class",
  "nation",
  "type",
  "gun_type",
  "health",
  "damage",
  "reload",
] as const;

export type ClueKey = (typeof clueKeys)[number];

const numericClueKeys: ClueKey[] = ["tier", "health", "damage", "reload"];

export function tankClues(tank: TankDefinition) {
  const turret = tank.turrets.at(-1)!;
  const gun = turret.guns.at(-1)!;
  const gunType = gun.gun_type!;

  return {
    tier: tank.tier,
    class: tank.class,
    nation: tank.nation,
    type: tank.type,
    gun_type: gunType.$case,
    health: tank.health + turret.health,
    damage: gun.shells[0].armor_damage,
    reload: Number(
      (gunType.$case === "regular"
        ? gunType.value.reload
        : gunType.value.intra_clip
      ).toFixed(1),
    ),
  };
}

export type TankClues = ReturnType<typeof tankClues>;

export function compareClue(key: ClueKey, guess: TankClues, target: TankClues) {
  if (guess[key] === target[key]) return ClueResult.Correct;
  if (!numericClueKeys.includes(key)) return ClueResult.Incorrect;

  return (target[key] as number) > (guess[key] as number)
    ? ClueResult.Higher
    : ClueResult.Lower;
}
