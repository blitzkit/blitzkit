import { calculateWN8 } from "../calculateWN8";
import {
  type BlitzkitStats,
  type CompositeStats,
  compositeStatsFormatting,
  type CompositeStatsKey,
} from "./constants";

export function compositeStats(stats: BlitzkitStats, average: BlitzkitStats) {
  return {
    normalized_damage_dealt: stats.damage_dealt / stats.battles,
    normalized_damage_received: stats.damage_received / stats.battles,
    normalized_deaths: (stats.battles - stats.survived_battles) / stats.battles,
    normalized_frags: stats.frags / stats.battles,
    normalized_hits: stats.hits / stats.battles,
    normalized_losses: stats.losses / stats.battles,
    normalized_misses: (stats.shots - stats.hits) / stats.battles,
    normalized_shots: stats.shots / stats.battles,
    normalized_spotted: stats.spotted / stats.battles,
    normalized_survived_battles: stats.survived_battles / stats.battles,
    normalized_win_and_survived: stats.win_and_survived / stats.battles,
    normalized_wins: stats.wins / stats.battles,
    normalized_xp: stats.xp / stats.battles,
    normalized_battle_life_time: stats.battle_life_time / stats.battles,

    cumulative_accuracy: stats.hits / stats.shots,
    cumulative_battles: stats.battles,
    cumulative_capture_points: stats.capture_points,
    cumulative_damage_dealt: stats.damage_dealt,
    cumulative_damage_ratio: stats.damage_dealt / stats.damage_received,
    cumulative_damage_received: stats.damage_received,
    cumulative_deaths: stats.battles - stats.survived_battles,
    cumulative_dropped_capture_points: stats.dropped_capture_points,
    cumulative_frags: stats.frags,
    cumulative_hits: stats.hits,
    cumulative_inaccuracy: (stats.shots - stats.hits) / stats.shots,
    cumulative_kills_to_death_ratio:
      stats.frags / (stats.battles - stats.survived_battles),
    cumulative_losses: stats.losses,
    cumulative_misses: stats.shots - stats.hits,
    cumulative_shots: stats.shots,
    cumulative_spotted: stats.spotted,
    cumulative_survived_battles: stats.survived_battles,
    cumulative_win_and_survived: stats.win_and_survived,
    cumulative_wins: stats.wins,
    cumulative_xp: stats.xp,
    cumulative_wn8: calculateWN8(average, stats),
    cumulative_battle_life_time: stats.battle_life_time,
  } satisfies CompositeStats;
}

export function formatCompositeStat(
  value: number,
  key: CompositeStatsKey,
  composite: CompositeStats
) {
  if (composite.cumulative_battles === 0) return "--";

  const formatting = compositeStatsFormatting[key];
  const resolvedValue = (formatting.coefficient ?? 1) * value;
  return `${
    formatting.localeFormat
      ? Math.round(resolvedValue).toLocaleString()
      : resolvedValue.toFixed(formatting.fixed)
  }${formatting.unit ?? ""}`;
}

export * from "./constants";
