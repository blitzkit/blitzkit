import { TANK_CLASSES } from "../blitz/constants";
import { GameDefinitions, TankDefinition, TankType } from "../protos";

const treeTypeOrder = [
  TankType.RESEARCHABLE,
  TankType.PREMIUM,
  TankType.COLLECTOR,
];

export function metaSortTank(
  tanks: TankDefinition[],
  gameDefinitions: GameDefinitions
) {
  return tanks
    .sort((a, b) => b.tier - a.tier)
    .sort(
      (a, b) => treeTypeOrder.indexOf(b.type) - treeTypeOrder.indexOf(a.type)
    )
    .sort(
      (a, b) => TANK_CLASSES.indexOf(b.class) - TANK_CLASSES.indexOf(a.class)
    )
    .sort(
      (a, b) =>
        gameDefinitions.nations.indexOf(b.nation) -
        gameDefinitions.nations.indexOf(a.nation)
    )
    .sort((a, b) => a.tier - b.tier);
}
