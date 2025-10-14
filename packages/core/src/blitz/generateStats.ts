import { type BlitzStats, calculateWN8 } from "../statistics";

export type Stat = keyof ReturnType<typeof generateStats>;

export const STAT_NAMES: Record<Stat, string> = {
  battles: "Battles",
  winrate: "Winrate",
  wn8: "WN8",
  averageDamage: "Damage",
  damage: "Accumulated damage",
  wins: "Wins",
};

export const STAT_KEYS = Object.keys(STAT_NAMES) as Stat[];

export function generateStats(s: BlitzStats, e?: BlitzStats) {
  return {
    battles: s.battles,
    wins: s.wins,
    winrate: s.wins / s.battles,
    wn8: e ? calculateWN8(e, s) : null,
    damage: s.damage_dealt,
    averageDamage: s.damage_dealt / s.battles,
  };
}

export function prettifyStats(s: ReturnType<typeof generateStats>) {
  return {
    battles: `${s.battles}`,
    wins: `${s.wins}`,
    winrate: `${(s.winrate * 100).toFixed(0)}%`,
    wn8: s.wn8 ? s.wn8.toFixed(0) : "--",
    damage: `${s.damage}`,
    averageDamage: s.averageDamage.toFixed(0),
  } satisfies Record<Stat, string>;
}

export function sumBlitzStarsStats(s: ReturnType<typeof generateStats>[]) {
  function sum(slice: (stat: ReturnType<typeof generateStats>) => number) {
    return s.reduce((a, b) => a + slice(b), 0);
  }

  const battles = sum((s) => s.battles);
  const wins = sum((s) => s.wins);
  const damage = sum((s) => s.damage);

  return {
    battles,
    wins,
    winrate: wins / battles,
    damage,
    averageDamage: damage / battles,
    wn8:
      sum((s) => (s.wn8 ? s.wn8 * s.battles : 0)) /
      sum((s) => (s.wn8 ? s.battles : 0)),
  } satisfies ReturnType<typeof generateStats>;
}
