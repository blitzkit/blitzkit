import { ShellDefinition, ShellType } from "../protos";

export function isExplosive(
  type: ShellDefinition["type"],
): type is ShellType.SHELL_TYPE_HEAT | ShellType.SHELL_TYPE_HE {
  return type === ShellType.SHELL_TYPE_HEAT || type === ShellType.SHELL_TYPE_HE;
}
