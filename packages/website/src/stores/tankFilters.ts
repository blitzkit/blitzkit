import type { CaseType } from "@blitzkit/core";
import type {
  GunDefinition,
  ShellType,
  TankClass,
  TankType,
} from "@blitzkit/protos";
import { Soapstone } from "soapstone";

export interface TankFilters {
  tiers: number[];
  nations: string[];
  classes: TankClass[];
  types: TankType[];
  search: string | null;
  gunType: CaseType<GunDefinition>[];
  shells: [ShellType | null, ShellType | null, ShellType | null];
  consumables: number[];
  provisions: number[];
  abilities: number[];
  powers: number[];

  showTesting: boolean;
  showNonTesting: boolean;
  showOwned: boolean;
  showUnowned: boolean;
}

export const TankFilters = new Soapstone<TankFilters>({
  tiers: [],
  nations: [],
  classes: [],
  types: [],
  search: null,
  gunType: [],
  shells: [null, null, null],
  consumables: [],
  provisions: [],
  abilities: [],
  powers: [],

  showTesting: false,
  showNonTesting: false,
  showOwned: false,
  showUnowned: false,
});
