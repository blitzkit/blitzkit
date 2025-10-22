import { enableMapSet } from "immer";
import { Varuna } from "varuna";
import { tierListRows } from "../components/TierList/Table/constants";

export interface TierList {
  dragging: boolean;
  rows: { name: string; tanks: number[] }[];
  placedTanks: Set<number>;
}

export const TierList = new Varuna<TierList>({
  dragging: false,
  rows: tierListRows.map((row) => ({ name: row.name, tanks: [] })),
  placedTanks: new Set(),
});

enableMapSet();
