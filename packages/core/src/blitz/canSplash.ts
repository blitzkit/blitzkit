import { ShellDefinition, ShellType } from "../protos";

export function canSplash(type: ShellDefinition["type"]): type is ShellType.HE {
  return type === ShellType.HE;
}
