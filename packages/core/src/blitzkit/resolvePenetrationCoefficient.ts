import { Equalizer, ShellType } from "../protos";

export function resolvePenetrationCoefficient(
  calibratedShells: boolean,
  equalize: boolean,
  type: ShellType,
  equalizerObj?: Equalizer,
) {
  const calibrated = calibratedShells
    ? type === ShellType.SHELL_TYPE_AP
      ? 1.06
      : type === ShellType.SHELL_TYPE_APCR
        ? 1.06
        : type === ShellType.SHELL_TYPE_HEAT
          ? 1.07
          : 1.07
    : 1;
  const equalizer = (equalize ? equalizerObj?.penetration : undefined) ?? 1;

  return calibrated * equalizer;
}
