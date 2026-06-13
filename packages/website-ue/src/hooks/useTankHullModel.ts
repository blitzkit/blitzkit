import { useProtagonist } from "./useProtagonist";
import { useTankModel } from "./useTankModel";

export function useTankHullModel() {
  const tank = useProtagonist();
  return useTankModel(`/models/tanks/${tank.id}/hull.glb`);
}
