import { emptyAllStats } from '../blitz';
import type { BlitzStats } from '../statistics';

export interface IndividualTankStats {
  all: BlitzStats;
  last_battle_time: number;
  account_id: number;
  max_xp: number;
  in_garage_updated: number;
  max_frags: number;
  frags: number | null;
  mark_of_mastery: number;
  battle_life_time: number;
  in_garage: number | null;
  tank_id: number;
}

export interface TanksStats {
  [accountId: number]: null | IndividualTankStats[];
}

export interface NormalizedTankStats {
  [tankId: number]: IndividualTankStats;
}

export const emptyIndividualTankStats: IndividualTankStats = {
  all: emptyAllStats,
  last_battle_time: 0,
  account_id: 0,
  max_xp: 0,
  in_garage_updated: 0,
  max_frags: 0,
  frags: 0,
  battle_life_time: 0,
  in_garage: 0,
  tank_id: 0,
  mark_of_mastery: 0,
};
