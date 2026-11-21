import { formatCompact } from "@blitzkit/core";
import type { AverageDefinitionsAllStats } from "@blitzkit/protos";
import { CharacteristicRanking } from "../types/characteristics";

export interface PerformanceEntry {
  stats: AverageDefinitionsAllStats;
  players: number;
}

export interface PerformanceStat {
  value: (entry: PerformanceEntry) => number;
  format: (value: number, locale: string) => string;
  ranking: CharacteristicRanking;
}

function perBattle(key: keyof AverageDefinitionsAllStats) {
  return ({ stats }: PerformanceEntry) => stats[key] / stats.battles;
}

function percentage(decimals: number) {
  return (value: number) => `${(value * 100).toFixed(decimals)}%`;
}

function fixed(decimals: number) {
  return (value: number) => value.toFixed(decimals);
}

function integer(value: number, locale: string) {
  return Math.round(value).toLocaleString(locale);
}

// TODO: formalize this more like characteristics
export const performanceStats = {
  winrate: {
    value: perBattle("wins"),
    format: percentage(1),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  players: {
    value: ({ players }) => players,
    format: (value, locale) => formatCompact(locale, Math.round(value)),
    ranking: CharacteristicRanking.None,
  },
  damage: {
    value: perBattle("damage_dealt"),
    format: integer,
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  survival: {
    value: perBattle("survived_battles"),
    format: percentage(0),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  xp: {
    value: perBattle("xp"),
    format: integer,
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  kills: {
    value: perBattle("frags"),
    format: fixed(2),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  spots: {
    value: perBattle("spotted"),
    format: fixed(2),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  accuracy: {
    value: ({ stats }) => stats.hits / stats.shots,
    format: percentage(0),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  shots: {
    value: perBattle("shots"),
    format: fixed(1),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  hits: {
    value: perBattle("hits"),
    format: fixed(1),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  damage_ratio: {
    value: ({ stats }) => stats.damage_dealt / stats.damage_received,
    format: fixed(2),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
  damage_taken: {
    value: perBattle("damage_received"),
    format: integer,
    ranking: CharacteristicRanking.LowerIsBetter,
  },
  capture_points: {
    value: perBattle("capture_points"),
    format: fixed(2),
    ranking: CharacteristicRanking.HigherIsBetter,
  },
} satisfies Record<string, PerformanceStat>;

export type PerformanceStatName = keyof typeof performanceStats;

export const performanceStatNames = Object.keys(
  performanceStats,
) as PerformanceStatName[];
