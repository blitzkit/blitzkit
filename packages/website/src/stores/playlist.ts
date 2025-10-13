import type { TankDefinition } from "@blitzkit/core";
import { Varuna } from "varuna";

export interface Playlist {
  list?: {
    index: number;
    tank: TankDefinition;
    battles?: number;
    wins?: number;
  }[];
}

export const Playlist = new Varuna<Playlist>({}, "playlist");
