import type { TankEnvironment } from "@blitzkit/core";
import { Soapstone } from "soapstone";
import { resolveTankModules } from "../tankopedia/resolveTankModules";
import type { TankState } from "../tankopedia/tankState";
import { TankopediaSortDirection } from "./tankopediaPersistent";
import type { TankSort } from "./tankopediaSort";

export interface CompareMember {
  key: string;
  state: TankState;
}

export interface CompareEphemeral {
  environment: TankEnvironment;
  syncShells: boolean;
  members: CompareMember[];
  sorting: TankSort;
}

export const CompareEphemeral = new Soapstone<
  CompareEphemeral,
  [TankEnvironment]
>((environment) => ({
  environment,
  syncShells: false,
  members: [],
  sorting: { by: null, direction: TankopediaSortDirection.Descending },
}));

// Picks the shell at the same slot on every member, where one exists
export function syncShellSlot(members: CompareMember[], slot: number) {
  for (const member of members) {
    const { gun } = resolveTankModules(member.state);
    const shell = gun.shells[slot];

    if (shell) member.state.shell = shell.id;
  }
}
