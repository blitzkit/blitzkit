import { api } from "../core/api/dynamic";
import { useAwait } from "./useAwait";

export function useTierCompare() {
  const tiers = useAwait(() => api.tiers(), "tiers");

  function compare(a: string, b: string) {
    const [, tierNameA] = a.split(".");
    const [, tierNameB] = b.split(".");
    const tierA = tiers.tiers[tierNameA];
    const tierB = tiers.tiers[tierNameB];

    return tierB.carousel_level - tierA.carousel_level;
  }

  return compare;
}
