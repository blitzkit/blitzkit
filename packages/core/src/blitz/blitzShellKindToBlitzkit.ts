import { ShellType } from "@blitzkit/protos";
import { ShellKind } from "../types";

export const blitzShellKindToBlitzkit: Record<ShellKind, ShellType> = {
  ARMOR_PIERCING: ShellType.SHELL_TYPE_AP,
  ARMOR_PIERCING_CR: ShellType.SHELL_TYPE_APCR,
  HIGH_EXPLOSIVE: ShellType.SHELL_TYPE_HE,
  HOLLOW_CHARGE: ShellType.SHELL_TYPE_HEAT,
};

// @ts-ignore
export const blitzkitToBlitzShellKind: Record<ShellType, ShellKind> = {};

for (const [key, value] of Object.entries(blitzShellKindToBlitzkit)) {
  blitzkitToBlitzShellKind[value] = key as ShellKind;
}
