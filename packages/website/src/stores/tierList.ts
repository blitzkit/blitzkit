import { enableMapSet } from "immer";
import { Soapstone } from "soapstone";
import { tierListRows } from "../components/TierList/Table/constants";

export interface TierList {
  dragging: boolean;
  rows: { name: string; tanks: number[] }[];
  placedTanks: Set<number>;
}

export const TierList = new Soapstone<TierList>({
  dragging: false,
  rows: tierListRows.map((row) => ({ name: row.name, tanks: [] })),
  placedTanks: new Set(),
});

enableMapSet();
