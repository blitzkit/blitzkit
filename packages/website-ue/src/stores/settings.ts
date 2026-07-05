import { Varuna } from "varuna";
import {
  settings,
  type SettingName,
  type SettingTypes,
} from "../config/settings";

type Settings = Record<SettingName, SettingTypes>;

const defaults: Partial<Settings> = {};

for (const key in settings) {
  const setting = settings[key as SettingName];
  defaults[key as SettingName] = setting.default;
}

export const Settings = new Varuna<Settings>(defaults as Settings, "settings");
