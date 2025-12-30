import type {
  GunDefinition,
  ShellType,
  TankClass,
  TankType,
} from "@blitzkit/core";
import { Varuna } from "varuna";

export type CaseType<T> = T extends {
  gun_type?: { $case: infer U; value: any };
}
  ? U
  : never;

export interface TankFilters {
  tiers: number[];
  nations: string[];
  classes: TankClass[];
  types: TankType[];
  search: string | null;
  searching: boolean;
  gunType: CaseType<GunDefinition>[];
  shells: [ShellType | null, ShellType | null, ShellType | null];
  consumables: number[];

  showTesting: boolean;
  showNonTesting: boolean;
  showOwned: boolean;
  showUnowned: boolean;
}

export const TankFilters = new Varuna<TankFilters>({
  tiers: [],
  nations: [],
  classes: [],
  types: [],
  search: null,
  searching: false,
  gunType: [],
  shells: [null, null, null],
  consumables: [], // Added this line

  showTesting: true,
  showNonTesting: true,
  showOwned: true,
  showUnowned: true,
});
