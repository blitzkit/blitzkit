import type en from "@blitzkit/i18n/strings/en.json";
import { Varuna } from "varuna";

export type TankopediaSortBy = keyof typeof en.website.common.tank_search.sort;
export type TankopediaSortDirection = "ascending" | "descending";
export type TankopediaTestTankDisplay = "include" | "exclude" | "only";

export interface TankopediaPersistent {
  wireframe: boolean;
  opaque: boolean;
  advancedHighlighting: boolean;
  greenPenetration: boolean;
  showSpacedArmor: boolean;
  showExternalModules: boolean;
  showPrimaryArmor: boolean;
  recentlyViewed: number[];
  hideTankModelUnderArmor: boolean;

  sort: {
    by: TankopediaSortBy;
    direction: TankopediaSortDirection;
  };
}

export const TankopediaPersistent = new Varuna<TankopediaPersistent>(
  {
    hideTankModelUnderArmor: false,
    wireframe: false,
    opaque: false,
    advancedHighlighting: false,
    greenPenetration: false,
    showSpacedArmor: true,
    showExternalModules: true,
    showPrimaryArmor: true,
    recentlyViewed: [],
    sort: {
      by: "meta.none",
      direction: "ascending",
    },
  },
  "tankopedia-2"
);
