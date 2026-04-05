import { ShellDefinition, ShellType } from "../protos";

export function canSplash(
  type: ShellDefinition["type"],
): type is ShellType.SHELL_TYPE_HE {
  return type === ShellType.SHELL_TYPE_HE;
}
