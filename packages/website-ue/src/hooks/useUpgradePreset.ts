import { api } from "../api/dynamic";
import { useAwait } from "./useAwait";

export function useUpgradePreset(name: string) {
  const presets = useAwait(
    () => api.tankUpgradePresets(),
    "tank-upgrade-presets",
  );

  return presets.presets[name];
}
