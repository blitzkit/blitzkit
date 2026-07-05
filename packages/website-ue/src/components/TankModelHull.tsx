import { useProtagonist } from "../hooks/useProtagonist";
import { TankModelPart } from "./TankModelPart";

export function TankModelHull() {
  const tank = useProtagonist();

  const map = {
    Mesh: true,
    CollisionMesh: false,
  };

  return <TankModelPart url={`/models/tanks/${tank.id}/hull.glb`} map={map} />;
}
