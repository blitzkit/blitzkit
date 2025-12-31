import type { TankDefinition } from "@blitzkit/core";
import { checkConsumableProvisionInclusivity } from "@blitzkit/core/src/blitzkit/checkConsumableProvisionInclusivity";
import { times } from "lodash-es";
import { awaitableConsumableDefinitions } from "../../core/awaitables/consumableDefinitions";
import type { TankFilters } from "../../stores/tankFilters";
import { awaitableProvisionDefinitions } from "../awaitables/provisionDefinitions";

const SHELLS = times(3, (index) => index);

const consumableDefinitions = await awaitableConsumableDefinitions;
const provisionDefinitions = await awaitableProvisionDefinitions;

export async function filterTank(
  filters: TankFilters,
  tank: TankDefinition,
  owned: number[] = []
) {
  return (
    ((filters.showOwned && owned.includes(tank.id)) ||
      (filters.showUnowned && !owned.includes(tank.id))) &&
    (filters.tiers.length === 0 || filters.tiers.includes(tank.tier)) &&
    (filters.nations.length === 0 || filters.nations.includes(tank.nation)) &&
    (filters.classes.length === 0 || filters.classes.includes(tank.class)) &&
    (filters.types.length === 0 || filters.types.includes(tank.type)) &&
    ((filters.showTesting && tank.testing) ||
      (filters.showNonTesting && !tank.testing)) &&
    (filters.gunType.length === 0 ||
      (filters.gunType.includes("regular") &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === "regular")
        )) ||
      (filters.gunType.includes("auto_loader") &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === "auto_loader")
        )) ||
      (filters.gunType.includes("auto_reloader") &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === "auto_reloader")
        ))) &&
    tank.turrets.some((turret) =>
      turret.guns.some((gun) =>
        SHELLS.every(
          (index) =>
            filters.shells[index] === null ||
            gun.shells[index] === undefined ||
            gun.shells[index].type === filters.shells[index]
        )
      )
    ) &&
    (filters.consumables.length === 0 ||
      filters.consumables.every((consumable) =>
        tank.turrets.some((turret) =>
          turret.guns.some((gun) =>
            checkConsumableProvisionInclusivity(
              consumableDefinitions.consumables[consumable],
              tank,
              gun
            )
          )
        )
      )) &&
    (filters.provisions.length === 0 ||
      filters.provisions.every((provision) =>
        tank.turrets.some((turret) =>
          turret.guns.some((gun) =>
            checkConsumableProvisionInclusivity(
              provisionDefinitions.provisions[provision],
              tank,
              gun
            )
          )
        )
      ))
  );
}
