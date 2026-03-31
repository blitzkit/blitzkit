import { times } from "lodash-es";
import { CrewType, ShellType, TankClass, TankType } from "../../protos";

export const SHELL_NAMES: Record<ShellType, string> = {
  [ShellType.SHELL_TYPE_AP]: "AP",
  [ShellType.SHELL_TYPE_APCR]: "APCR",
  [ShellType.SHELL_TYPE_HEAT]: "HEAT",
  [ShellType.SHELL_TYPE_HE]: "HE",
};
export const CREW_MEMBER_NAMES = {
  [CrewType.CREW_TYPE_COMMANDER]: "commander",
  [CrewType.CREW_TYPE_DRIVER]: "driver",
  [CrewType.CREW_TYPE_GUNNER]: "gunner",
  [CrewType.CREW_TYPE_LOADER]: "loader",
  [CrewType.CREW_TYPE_RADIOMAN]: "radioman",
} as const;

/**
 * @deprecated use svg
 */
export const TANK_ICONS: Record<TankClass, string> = {
  [TankClass.TANK_CLASS_TANK_DESTROYER]: "https://i.imgur.com/BIHSEH0.png",
  [TankClass.TANK_CLASS_LIGHT]: "https://i.imgur.com/CSNha5V.png",
  [TankClass.TANK_CLASS_MEDIUM]: "https://i.imgur.com/wvf3ltm.png",
  [TankClass.TANK_CLASS_HEAVY]: "https://i.imgur.com/ECeqlZa.png",
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS_PREMIUM: Record<TankClass, string> = {
  [TankClass.TANK_CLASS_TANK_DESTROYER]: "https://i.imgur.com/TCu3EdR.png",
  [TankClass.TANK_CLASS_LIGHT]: "https://i.imgur.com/zdkpTRb.png",
  [TankClass.TANK_CLASS_MEDIUM]: "https://i.imgur.com/3z7eHX6.png",
  [TankClass.TANK_CLASS_HEAVY]: "https://i.imgur.com/P3vbmyA.png",
};
/**
 * @deprecated use svg
 */
export const TANK_ICONS_COLLECTOR: Record<TankClass, string> = {
  [TankClass.TANK_CLASS_TANK_DESTROYER]: "https://i.imgur.com/WTjeirB.png",
  [TankClass.TANK_CLASS_LIGHT]: "https://i.imgur.com/EwhtKkU.png",
  [TankClass.TANK_CLASS_MEDIUM]: "https://i.imgur.com/u8YDMBh.png",
  [TankClass.TANK_CLASS_HEAVY]: "https://i.imgur.com/8xRf3nc.png",
};
export const TIERS = times(10, (index) => index + 1);
export const TIER_ROMAN_NUMERALS: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
  7: "VII",
  8: "VIII",
  9: "IX",
  10: "X",
};

export const flags: Record<string, string> = {
  ussr: "<:ussr:1218421042033197197>",
  germany: "🇩🇪",
  usa: "🇺🇸",
  china: "🇨🇳",
  uk: "🇬🇧",
  france: "🇫🇷",
  japan: "🇯🇵",
  european: "🇪🇺",
  other: "<:other:1218421572243558482>",
};
export const TREE_TYPE_ICONS: Record<TankType, Record<TankClass, string>> = {
  [TankType.TANK_TYPE_RESEARCHABLE]: TANK_ICONS,
  [TankType.TANK_TYPE_PREMIUM]: TANK_ICONS_PREMIUM,
  [TankType.TANK_TYPE_COLLECTOR]: TANK_ICONS_COLLECTOR,
};
