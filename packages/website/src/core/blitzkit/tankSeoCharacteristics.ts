import {
  createDefaultProvisions,
  createDefaultSkills,
  type EquipmentDefinitions,
  type ModelDefinition,
  type ProvisionDefinitions,
  type SkillDefinitions,
  type TankDefinition,
} from "@blitzkit/core";
import { genericDefaultEquipmentMatrix } from "../../stores/duel/constants";
import { tankCharacteristics } from "./tankCharacteristics";

/**
 * Shared "generic loadout" characteristics used for both the tank SEO
 * description and the tank opengraph poster, so the numbers shown in
 * search results, link previews, and the poster stay consistent.
 */
export function tankSeoCharacteristics(
  tank: TankDefinition,
  tankModelDefinition: ModelDefinition,
  skillDefinitions: SkillDefinitions,
  provisionDefinitions: ProvisionDefinitions,
  equipmentDefinitions: EquipmentDefinitions,
) {
  const turret = tank.turrets.at(-1)!;
  const gun = turret.guns.at(-1)!;
  const shell = gun.shells[0];

  return tankCharacteristics(
    {
      tank,
      applyDynamicArmor: false,
      applyReactiveArmor: false,
      applySpallLiner: false,
      camouflage: true,
      consumables: [],
      crewSkills: createDefaultSkills(skillDefinitions),
      engine: tank.engines.at(-1)!,
      equipmentMatrix: genericDefaultEquipmentMatrix,
      turret,
      gun,
      provisions: createDefaultProvisions(tank, gun, provisionDefinitions),
      shell,
      stockEngine: tank.engines[0],
      stockGun: tank.turrets[0].guns[0],
      stockTurret: tank.turrets[0],
      stockTrack: tank.tracks[0],
      track: tank.tracks.at(-1)!,
      assaultDistance: 0,
      equalize: false,
    },
    { equipmentDefinitions, provisionDefinitions, tankModelDefinition },
  );
}
