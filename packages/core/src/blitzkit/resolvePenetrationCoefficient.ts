import { ShellType } from "../protos";

export function resolvePenetrationCoefficient(
  calibratedShells: boolean,
  type: ShellType,
) {
  if (!calibratedShells) return 1;

  return type === ShellType.SHELL_TYPE_AP
    ? 1.08
    : type === ShellType.SHELL_TYPE_APCR
      ? 1.05
      : type === ShellType.SHELL_TYPE_HEAT
        ? 1.13
        : 1.08;
}
