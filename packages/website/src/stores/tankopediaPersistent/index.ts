import { Soapstone } from "soapstone";

export enum TankopediaSortDirection {
  Ascending,
  Descending,
}

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
  highGraphics: boolean;
}

export const TankopediaPersistent = new Soapstone<TankopediaPersistent>(
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
    highGraphics: true,
  },
  "tankopedia-3",
);
