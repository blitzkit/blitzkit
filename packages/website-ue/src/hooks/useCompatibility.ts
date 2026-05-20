import type { CompatibilityComponent } from "@protos/blitz_static_compatibility_component";
import type { TankCompatibility_Include } from "@protos/blitz_static_tank_compatibility";
import { TankTraits } from "@protos/blitz_static_tank_compatibility";
import { TankAttributeChange_AttributeName } from "@protos/blitz_static_tank_upgrade_single_stage";
import type { Sets } from "@protos/sets";
import type { Tank } from "@protos/tank";
import { useSets } from "./useSets";

export function useCompatibility(tank: Tank) {
  const sets = useSets();

  return function (compatibility: CompatibilityComponent) {
    if (
      compatibility.tank_set_compatibility ||
      compatibility.game_type_compatibility ||
      compatibility.quest_compatibility ||
      compatibility.quest_slots_compatibility ||
      compatibility.tank_style_compatibility
    ) {
      throw new Error("Not implemented");
    }

    return (
      compatibility.tank_compatibility === undefined ||
      (tankCompatibilityApplies(
        compatibility.tank_compatibility.include,
        tank,
        sets,
      ) &&
        !tankCompatibilityApplies(
          compatibility.tank_compatibility.exclude,
          tank,
          sets,
        ))
    );
  };
}

function tankCompatibilityApplies(
  include: TankCompatibility_Include | undefined,
  tank: Tank,
  sets: Sets,
) {
  if (include === undefined) {
    return true;
  }

  if (include.is_special) {
    throw new Error("is_special Not implemented");
  }

  return (
    include.nations.some((nation) => nation === tank.tank!.nation) ||
    include.tiers.some((tier) => tier === tank.tank!.tier) ||
    include.tier_catalog_ids.some(
      (tier) => tier === tank.tank!.tier_catalog_id,
    ) ||
    include.classes.some((_class) => _class === tank.tank!.tank_class) ||
    include.catalogs_id.some((id) => id === tank.id) ||
    include.tank_traits.some((trait) => tankHasTraits(trait, tank)) ||
    include.types.some((type) => type === tank.tank!.tank_type) ||
    include.tank_sets_catalog_ids.some((id) =>
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
    include.tech_tags.some((tag) => tank.tank!.tech_tags.includes(tag))
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
