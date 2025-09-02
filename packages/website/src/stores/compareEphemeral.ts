import { Varuna } from "varuna";
import type { DuelMember } from "./duel";

export interface CompareMember extends DuelMember {
  key: string;
}

export interface CompareEphemeral {
  crewSkills: Record<string, number>;
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
  members: [],
}));
