import type { weights } from "../config/styles";

export type Space = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;
export type SpaceWithout0 = Exclude<Space, "0">;

export type Radius = Space | "full";

export type Weight = keyof typeof weights;
