import { useProtagonist } from "../hooks/useProtagonist";
import { TankModelPart } from "./TankModelPart";

export function TankModelChassis() {
  const tank = useProtagonist();

  const map = {
    Wheels: true,
    LeftTracks: true,
    RightTracks: true,
    LeftTrackCrashed: false,
    RightTrackCrashed: false,
    CollisionMesh: false,
  };

  return (
    <TankModelPart url={`/models/tanks/${tank.id}/chassis.glb`} map={map} />
  );
}
