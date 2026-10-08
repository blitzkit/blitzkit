import { times } from "lodash-es";
import { CrewType, ShellType } from "../../protos";

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
  11: "XI",
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
