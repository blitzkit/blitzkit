import {
  VisualChanges_TankPart,
  type StageParameters,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { useProtagonist } from "./useProtagonist";
import { useTankModel } from "./useTankModel";

export function useTankTurretModel(parameters: StageParameters) {
  const tank = useProtagonist();
  const selected = parameters.visual_changes.find(
    ({ tank_part }) => tank_part === VisualChanges_TankPart.TANK_PART_TURRET,
  );

  const map = {
    Mesh: true,
    CollisionMesh: false,
  };

  return useTankModel(`/models/tanks/${tank.id}/${selected!.name}.glb`, map);
}
