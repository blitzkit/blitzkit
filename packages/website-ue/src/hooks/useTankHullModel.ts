import { useProtagonist } from "./useProtagonist";
import { useTankModel } from "./useTankModel";

export function useTankHullModel() {
  const tank = useProtagonist();

  const map = {
    Mesh: true,
    CollisionMesh: false,
  };

  return useTankModel(`/models/tanks/${tank.id}/hull.glb`, map);
}
