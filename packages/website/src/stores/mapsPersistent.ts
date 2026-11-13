import { Varuna } from "varuna";

export interface MapsPersistent {
  recentlyViewed: number[];
}

export const MapsPersistent = new Varuna<MapsPersistent>(
  {
    recentlyViewed: [],
  },
  "maps-1",
);
