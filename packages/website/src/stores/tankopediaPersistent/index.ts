import type en from '@blitzkit/i18n/strings/en.json';
import * as lodash from 'lodash-es';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { createContextualStore } from '../../core/zustand/createContextualStore';

export type TankopediaSortBy = keyof typeof en.website.common.tank_search.sort;
export type TankopediaSortDirection = 'ascending' | 'descending';
export type TankopediaTestTankDisplay = 'include' | 'exclude' | 'only';

export interface TankopediaPersistentStore {
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

export const TankopediaPersistent = createContextualStore(() =>
  create<TankopediaPersistentStore>()(
    persist(
      subscribeWithSelector<TankopediaPersistentStore>(() => ({
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
          by: 'meta.none',
          direction: 'ascending',
        },
      })),
      { name: 'tankopedia', merge: (a, b) => lodash.merge(b, a) },
    ),
  ),
);
