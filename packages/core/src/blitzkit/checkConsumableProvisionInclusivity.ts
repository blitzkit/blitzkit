import {
  Consumable,
  ConsumableTankCategoryFilterCategory,
  GunDefinition,
  Provision,
  TankDefinition,
} from "../protos";

export function checkConsumableProvisionInclusivity(
  consumableProvision: Consumable | Provision,
  tank: TankDefinition,
  gun: GunDefinition
) {
  const included =
    !consumableProvision.game_mode_exclusive &&
    consumableProvision.include?.every((rule) => {
      switch (rule.filter_type!.$case) {
        case "tiers":
          return (
            rule.filter_type!.value.min <= tank.tier &&
            tank.tier <= rule.filter_type!.value.max
          );

        case "ids":
          return rule.filter_type!.value.ids.includes(tank.id);

        case "nations":
          return rule.filter_type!.value.nations.includes(tank.nation);

        case "categories":
          throw new SyntaxError("Category filtering found in include rule");
      }
    });
  const excluded =
    consumableProvision.game_mode_exclusive ||
    consumableProvision.exclude?.some((rule) => {
      switch (rule.filter_type!.$case) {
        case "tiers":
          return (
            rule.filter_type!.value.min <= tank.tier &&
            tank.tier <= rule.filter_type!.value.max
          );

        case "ids":
          return rule.filter_type!.value.ids.includes(tank.id);

        case "nations":
          return rule.filter_type!.value.nations.includes(tank.nation);

        case "categories":
          return rule.filter_type!.value.categories.some((category) => {
            switch (category) {
              case ConsumableTankCategoryFilterCategory.CLIP:
                return gun.gun_type!.$case !== "regular";
            }
          });
      }
    });

  return (
    !consumableProvision.game_mode_exclusive &&
    consumableProvision.include?.length > 0 &&
    included &&
    !excluded
  );
}
