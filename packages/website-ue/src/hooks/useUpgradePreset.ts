import { api } from "../core/api/dynamic";
import { useAwait } from "./useAwait";

export function useUpgradePreset(name: string) {
  const [, discriminator] = name.split(".");
  const preset = useAwait(
    () => api.tankUpgradePreset(discriminator),
    `tank-upgrade-preset-${discriminator}`,
  );

  return preset;
}
