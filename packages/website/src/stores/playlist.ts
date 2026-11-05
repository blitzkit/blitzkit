import { Soapstone } from "soapstone";

export interface PlaylistEntry {
  id: number;
  then?: { battles: number; wins: number; last: number };
  now?: { battles: number; wins: number; last: number };
  checked?: boolean;
}

export interface Playlist {
  list?: PlaylistEntry[];
}

export const Playlist = new Soapstone<Playlist>({}, "playlist");
