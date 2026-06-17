import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useTierPrices() {
  const tierPrices = useAwait(() => api.tierPrices(), "tier-prices");
  return tierPrices;
}
