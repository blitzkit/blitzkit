import { createRef } from "react";
import type { Color } from "../ui/color";

// Rows a fresh tier list starts with: S, then A onward
export const tierListDefaultRowCount = 5;

// Colors for the rows in order, before falling back to cycling every color
export const tierListRowColors: Color[] = [
  "tomato",
  "orange",
  "amber",
  "green",
  "blue",
];

// Every color a row can take; all read well under white text
export const tierListColors: Color[] = [
  "tomato",
  "crimson",
  "pink",
  "plum",
  "purple",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "jade",
  "green",
  "grass",
  "amber",
  "orange",
  "brown",
  "bronze",
];

// Dragging scrolls up to here before scrolling by the screen's edges
export const tierListTable = createRef<HTMLTableSectionElement>();

// One shared bar showing where a dragged tank would land
export const tierListInsertionMarker = createRef<HTMLDivElement>();
