import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useSets() {
  const sets = useAwait(() => api.sets(), "sets");
  return sets;
}
