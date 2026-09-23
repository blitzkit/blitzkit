import {
  ConsumableTankCategoryFilterCategory,
  type GunDefinition,
  type TankDefinition,
  type TankInclusivityFilter,
} from "@blitzkit/core";

export function useCompatibility(tank: TankDefinition, gun: GunDefinition) {
  return function (
    include?: TankInclusivityFilter[],
    exclude?: TankInclusivityFilter[],
  ) {
    return tankCompatibility(tank, gun, include, exclude);
  };
}

function tankCompatibility(
  tank: TankDefinition,
  gun: GunDefinition,
  include?: TankInclusivityFilter[],
  exclude?: TankInclusivityFilter[],
) {
  const included = include?.every((rule) => {
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
  const excluded = exclude?.some((rule) => {
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
            case ConsumableTankCategoryFilterCategory.CONSUMABLE_TANK_CATEGORY_FILTER_CATEGORY_CLIP:
              return gun.gun_type!.$case !== "regular";
          }
        });
    }
  });

  return include !== undefined && include?.length > 0 && included && !excluded;
}
