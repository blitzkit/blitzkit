import { CrewType, ShellType } from "@blitzkit/protos";
import { times } from "lodash-es";

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
