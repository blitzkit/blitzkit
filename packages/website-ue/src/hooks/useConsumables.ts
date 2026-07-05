import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useConsumables() {
  const consumables = useAwait(() => api.consumables(), "consumables");
  return consumables;
}
