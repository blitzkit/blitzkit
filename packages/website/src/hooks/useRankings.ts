import { useMemo } from "react";
import {
  calculateRankings,
  type CharacteristicRank,
} from "../tankopedia/calculateRankings";
import type {
  CharacteristicName,
  ComputedCharacteristics,
} from "../types/characteristics";
import { useComparisonCharacteristics } from "./useComparisonCharacteristics";

export function useRankings(
  characteristics: ComputedCharacteristics,
): Map<CharacteristicName, CharacteristicRank> {
  const comparisonCharacteristics = useComparisonCharacteristics();

  return useMemo(
    () => calculateRankings(characteristics, comparisonCharacteristics),
    [characteristics, comparisonCharacteristics],
  );
}
