import { BlitzStats } from "../statistics";
import { FetchBlitzParams, fetchBlitz } from "./fetchBlitz";
import { normalizeIds } from "./normalizeIds";
import { Region } from "./regions";

export interface SupplementaryStats {
  WN8?: number;
  tier?: number;
}

export interface ClanStats {
  spotted: number;
  max_frags_tank_id: number;
  hits: number;
  frags: number;
  max_xp: number;
  max_xp_tank_id: number;
  wins: number;
  losses: number;
  capture_points: number;
  battles: number;
  damage_dealt: number;
  damage_received: number;
  max_frags: number;
  shots: number;
  frags8p: number;
  xp: number;
  win_and_survived: number;
  survived_battles: number;
  dropped_capture_points: number;
}

export interface RatingStats {
  spotted: number;
  calibration_battles_left: number;
  hits: number;
  frags: number;
  recalibration_start_time: number;
  mm_rating: number;
  wins: number;
  losses: number;
  is_recalibration: boolean;
  capture_points: number;
  battles: number;
  damage_dealt: number;
  damage_received: number;
  shots: number;
  frags8p: number;
  xp: number;
  win_and_survived: number;
  survived_battles: number;
  dropped_capture_points: number;
}

export interface IndividualAccountInfo {
  account_id: number;
  created_at: number;
  updated_at: number;
  private: null;
  last_battle_time: number;
  nickname: string;
  statistics: {
    all: BlitzStats;
    clan: ClanStats;
    rating?: RatingStats;
    frags: null | number;
  };
}

export interface AccountInfo {
  [accountId: number]: IndividualAccountInfo;
}

export async function getAccountInfo<
  Ids extends number | number[],
  ReturnType = Ids extends number
    ? IndividualAccountInfo
    : IndividualAccountInfo[],
>(
  region: Region,
  ids: Ids,
  extra: string[] = [],
  params: FetchBlitzParams = {}
) {
  const object = await fetchBlitz<AccountInfo>(region, "account/info", {
    account_id: normalizeIds(ids),
    extra: extra.length === 0 ? undefined : extra.join(","),
    ...params,
  });

  if (typeof ids === "number") {
    return object[ids as number] as ReturnType;
  } else {
    return ids.map((id) => object[id]) as ReturnType;
  }
}
