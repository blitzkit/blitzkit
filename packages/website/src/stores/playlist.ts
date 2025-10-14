import type { TankDefinition } from "@blitzkit/core";
import { Varuna } from "varuna";

export interface PlaylistEntry {
  tank: TankDefinition;
  battles?: number;
  wins?: number;
  checked: boolean;
  last?: number;
}

export interface Playlist {
  list?: PlaylistEntry[];
}

export const Playlist = new Varuna<Playlist>({}, "playlist");
