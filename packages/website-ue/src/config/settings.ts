export enum SettingType {
  Boolean,
  Quality3,
}

interface SettingTypeBoolean {
  type: SettingType.Boolean;
  default: SettingBoolean;
}

interface SettingTypeQuality3 {
  type: SettingType.Quality3;
  default: SettingQuality3;
}

export enum SettingQuality3 {
  Low,
  Medium,
  High,
}

export enum SettingBoolean {
  False,
  True,
}

export type Setting = SettingTypeBoolean | SettingTypeQuality3;

export const settings = {
  tank_quality: {
    type: SettingType.Quality3,
    default: SettingQuality3.High,
  },
  lighting_quality: {
    type: SettingType.Quality3,
    default: SettingQuality3.High,
  },
  tank_slug_and_id: {
    type: SettingType.Boolean,
    default: SettingBoolean.False,
  },
  render_statistics: {
    type: SettingType.Boolean,
    default: SettingBoolean.False,
  },
} as const satisfies Record<string, Setting>;

export type SettingName = keyof typeof settings;

export interface SettingsGroup {
  name: string;
  settings: SettingName[];
}

export const settingsOrder: SettingsGroup[] = [
  {
    name: "general",
    settings: ["tank_quality", "lighting_quality"],
  },
  {
    name: "developer",
    settings: ["tank_slug_and_id", "render_statistics"],
  },
];

export type SettingTypes = Setting["default"];
