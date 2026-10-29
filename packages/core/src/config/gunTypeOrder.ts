import { GunDefinition } from "@blitzkit/protos";
import { CaseType } from "../types";

export const gunTypeOrder: CaseType<GunDefinition>[] = [
  "regular",
  "auto_loader",
  "auto_reloader",
];
