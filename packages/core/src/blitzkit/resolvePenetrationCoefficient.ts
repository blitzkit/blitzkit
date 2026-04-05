import { Equalizer, ShellType } from "../protos";

export function resolvePenetrationCoefficient(
  calibratedShells: boolean,
  equalize: boolean,
  type: ShellType,
  equalizerObj?: Equalizer,
) {
  const calibrated = calibratedShells
    ? type === ShellType.SHELL_TYPE_AP
      ? 1.08
      : type === ShellType.SHELL_TYPE_APCR
        ? 1.05
        : type === ShellType.SHELL_TYPE_HEAT
          ? 1.13
          : 1.08
    : 1;
  const equalizer = (equalize ? equalizerObj?.penetration : undefined) ?? 1;

  return calibrated * equalizer;
}
