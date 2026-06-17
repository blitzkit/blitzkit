import {
  VisualChanges_TankPart,
  type StageParameters,
} from "@protos/blitz_static_tank_upgrade_single_stage";
import { useProtagonist } from "../hooks/useProtagonist";
import { TankModelPart } from "./TankModelPart";

interface Props {
  parameters: StageParameters;
}

export function TankModelGun({ parameters }: Props) {
  const tank = useProtagonist();
  const selected = parameters.visual_changes.find(
    ({ tank_part }) => tank_part === VisualChanges_TankPart.TANK_PART_GUN,
  );

  const map = {
    GunMesh: true,
    MaskMesh: true,
    CollisionMesh: false,
  };

  return (
    <TankModelPart
      url={`/models/tanks/${tank.id}/${selected!.name}.glb`}
      map={map}
    />
  );
}
