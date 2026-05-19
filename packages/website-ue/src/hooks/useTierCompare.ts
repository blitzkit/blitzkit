import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useTierCompare() {
  const tiers = useAwait(() => api.tiers(), "tiers");

  function compare(a: string, b: string) {
    const tierA = tiers.tiers[a];
    const tierB = tiers.tiers[b];
    return tierB.carousel_level - tierA.carousel_level;
  }

  return compare;
}
