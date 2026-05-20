import type { CompatibilityComponent } from "@protos/blitz_static_compatibility_component";
import type { TankCompatibility_Include } from "@protos/blitz_static_tank_compatibility";
import { TankTraits } from "@protos/blitz_static_tank_compatibility";
import { TankAttributeChange_AttributeName } from "@protos/blitz_static_tank_upgrade_single_stage";
import type { Sets } from "@protos/sets";
import type { Tank } from "@protos/tank";
import { useSets } from "./useSets";

export function useCompatibility(
  compatibility: CompatibilityComponent,
  tank: Tank,
) {
  const sets = useSets();

  return function (
    {
      tank_compatibility,
      tank_set_compatibility,
      game_type_compatibility,
      quest_compatibility,
      quest_slots_compatibility,
      tank_style_compatibility,
    }: CompatibilityComponent,
    tank: Tank,
  ) {
    if (
      tank_set_compatibility ||
      game_type_compatibility ||
      quest_compatibility ||
      quest_slots_compatibility ||
      tank_style_compatibility
    ) {
      throw new Error("Not implemented");
    }

    if (
      tank_compatibility !== undefined &&
      (!tankCompatibilityApplies(tank_compatibility.include!, tank, sets) ||
        tankCompatibilityApplies(tank_compatibility.exclude!, tank, sets))
    ) {
      return false;
    }

    return true;
  };
}

function tankCompatibilityApplies(
  {
    nations,
    tiers,
    tier_catalog_ids,
    classes,
    catalogs_id,
    tank_traits,
    types,
    tank_sets_catalog_ids,
    is_special,
    tech_tags,
    ...rest
  }: TankCompatibility_Include,
  tank: Tank,
  sets: Sets,
) {
  if (is_special) {
    throw new Error("is_special Not implemented");
  }

  return (
    nations.some((nation) => nation === tank.tank!.nation) ||
    tiers.some((tier) => tier === tank.tank!.tier) ||
    tier_catalog_ids.some((tier) => tier === tank.tank!.tier_catalog_id) ||
    classes.some((_class) => _class === tank.tank!.tank_class) ||
    catalogs_id.some((id) => id === tank.id) ||
    tank_traits.some((trait) => tankHasTraits(trait, tank)) ||
    types.some((type) => type === tank.tank!.tank_type) ||
    tank_sets_catalog_ids.some((id) =>
      Object.entries(sets.sets).some(
        ([setId, set]) =>
          setId === id &&
          set.tank_set_rewards.some((reward) =>
            reward.tank_set_reward_on_level!.reward_list.some(
              (reward) => reward.tank_reward?.tank_catalog_id === tank.id,
            ),
          ),
      ),
    ) ||
    tech_tags.some((tag) => tank.tank!.tech_tags.includes(tag))
  );
}

function tankHasTraits(traits: TankTraits, tank: Tank) {
  switch (traits) {
    case TankTraits.TANK_TRAITS_HAS_CLIP:
      // TODO: use current tank state to check if the current gun has a clip

      return tank.tank!.upgrade_lines.some((line) =>
        line.stages.some((stage) =>
          stage.attributes.every((attribute) =>
            attribute.attribute_name !==
              TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP &&
            attribute.attribute_name ===
              TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
              ? attribute.value === 1
              : true,
          ),
        ),
      );

    default:
      throw new Error(`Unknown trait: ${traits}`);
  }
}
