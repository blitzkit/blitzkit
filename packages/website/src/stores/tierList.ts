import { Soapstone } from "soapstone";
import {
  tierListColors,
  tierListDefaultRowCount,
  tierListRowColors,
} from "../config/tierList";
import type { Color } from "../ui/color";

export interface TierListRowState {
  name: string;
  color: Color;
  tanks: number[];
}

export interface TierList {
  rows: TierListRowState[];
}

const A_CODE = "A".charCodeAt(0);

// The first row is S, then the lettering runs from A
export function createTierListRow(index: number) {
  const name = index === 0 ? "S" : String.fromCharCode(A_CODE + index - 1);
  const color =
    tierListRowColors[index] ?? tierListColors[index % tierListColors.length];

  return { name, color, tanks: [] } satisfies TierListRowState;
}

export const TierList = new Soapstone<TierList>({
  rows: Array.from({ length: tierListDefaultRowCount }, (_, index) =>
    createTierListRow(index),
  ),
});
