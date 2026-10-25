import { ModelDefinition, TurretModelDefinition } from "../protos";
import { unionBoundingBox } from "./unionBoundingBox";

export function tankBoundingBox(
  tankModelDefinition: ModelDefinition,
  turretModelDefinition: TurretModelDefinition,
) {
  const hull = tankModelDefinition.bounding_box!;
  const turret = turretModelDefinition.bounding_box!;
  const origin = tankModelDefinition.turret_origin!;

  if (
    turret.min!.x === turret.max!.x &&
    turret.min!.y === turret.max!.y &&
    turret.min!.z === turret.max!.z
  ) {
    return unionBoundingBox(hull, hull);
  }

  return unionBoundingBox(hull, {
    min: {
      x: turret.min!.x + origin.x,
      y: turret.min!.y + origin.z,
      z: turret.min!.z + origin.y,
    },
    max: {
      x: turret.max!.x + origin.x,
      y: turret.max!.y + origin.z,
      z: turret.max!.z + origin.y,
    },
  });
}
