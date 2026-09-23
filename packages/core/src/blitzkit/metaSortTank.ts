import { GameDefinitions, TankDefinition } from "@blitzkit/protos";
import { tankClassOrder } from "../config/tankClassOrder";
import { treeTypeOrder } from "../config/treeTypeOrder";

export function metaSortTank(
  tanks: TankDefinition[],
  gameDefinitions: GameDefinitions,
) {
  return tanks
    .sort((a, b) => b.tier - a.tier)
    .sort(
      (a, b) => treeTypeOrder.indexOf(b.type) - treeTypeOrder.indexOf(a.type),
    )
    .sort(
      (a, b) =>
        tankClassOrder.indexOf(b.class) - tankClassOrder.indexOf(a.class),
    )
    .sort(
      (a, b) =>
        gameDefinitions.nations.indexOf(b.nation) -
        gameDefinitions.nations.indexOf(a.nation),
    )
    .sort((a, b) => a.tier - b.tier);
}
