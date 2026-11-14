import {
  GunDefinition,
  ProvisionDefinitions,
  TankDefinition,
} from "@blitzkit/protos";
import { BlitzScripts } from "../types/blitzScripts";
import { availableProvisions } from "./availableProvisions";

const PROVISION_PREFERENCES = [
  19, // improved fuel
  18, // standard fuel
  22, // protective kit
];

function infinityFallback(value: number) {
  return value === -1 ? Infinity : value;
}

export function createDefaultProvisions(
  tank: TankDefinition,
  gun: GunDefinition,
  provisions: ProvisionDefinitions,
  scripts: BlitzScripts,
) {
  const provisionsList = availableProvisions(tank, gun, provisions);

  return provisionsList
    .sort(
      (a, b) =>
        infinityFallback(PROVISION_PREFERENCES.indexOf(a.id)) -
        infinityFallback(PROVISION_PREFERENCES.indexOf(b.id)),
    )
    .sort(
      (a, b) =>
        (scripts.provisions[b.id].bonusValues?.crewLevelIncrease ?? 0) -
        (scripts.provisions[a.id].bonusValues?.crewLevelIncrease ?? 0),
    )
    .slice(0, tank.max_provisions)
    .map(({ id }) => id);
}
