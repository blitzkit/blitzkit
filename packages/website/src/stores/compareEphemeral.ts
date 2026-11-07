import { Varuna } from "varuna";
import type { DuelMember } from "./duel";

export interface CompareMember extends DuelMember {
  key: string;
}

export interface CompareEphemeral {
  crewSkills: Record<string, number>;
  equalize: boolean;
  syncShells: boolean;
  members: CompareMember[];
  sorting?: {
    direction: "ascending" | "descending";
    by: number;
  };
}

export const CompareEphemeral = new Varuna<
  CompareEphemeral,
  Record<string, number>
>((crewSkills) => ({
  crewSkills,
  equalize: false,
  syncShells: false,
  members: [],
}));

export function syncShellSlot(members: CompareMember[], slot: number) {
  for (const member of members) {
    const shell = member.gun.shells[slot];

    if (shell) member.shell = shell;
  }
}
