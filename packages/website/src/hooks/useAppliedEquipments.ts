import { EquipmentPreset } from "@blitzkit/protos";
import type { EquipmentMatrix } from "../stores/duel";

export function useAppliedEquipments(
  matrix: EquipmentMatrix,
  preset: EquipmentPreset,
) {
  const flatMatrix = matrix.flat();
  return preset.slots.map(
    (options, index) => options[flatMatrix[index] == 1 ? "right" : "left"],
  );
}
