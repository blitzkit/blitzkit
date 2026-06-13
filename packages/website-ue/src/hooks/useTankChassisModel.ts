import { useProtagonist } from "./useProtagonist";
import { useTankModel } from "./useTankModel";

export function useTankChassisModel() {
  const tank = useProtagonist();

  const map = {
    Wheels: true,
    LeftTracks: true,
    RightTracks: true,
    LeftTrackCrashed: false,
    RightTrackCrashed: false,
    CollisionMesh: false,
  };

  return useTankModel(`/models/tanks/${tank.id}/chassis.glb`, map);
}
