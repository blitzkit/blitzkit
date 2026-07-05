import {
  settings,
  type SettingName,
  type SettingType,
  type SettingTypes,
} from "../config/settings";
import { Settings } from "../stores/settings";

export function useSetting<Type extends SettingTypes>(name: SettingName): Type {
  const value = Settings.use((state) => state[name]);

  return value as Type;
}

export function useSettingDeferred<Type extends SettingTypes>(
  name: SettingName,
): Type {
  const value = Settings.useDeferred(
    (state) => state[name],
    settings[name].default,
  );

  return value as Type;
}
