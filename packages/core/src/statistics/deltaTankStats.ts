import { type IndividualTankStats, emptyIndividualTankStats } from "../types";

export function deltaTankStats(
  tanksA: IndividualTankStats[],
  tanksB: IndividualTankStats[]
) {
  return tanksB
    .map((b) => {
      const a =
        tanksA.find((a) => a.tank_id === b.tank_id) ?? emptyIndividualTankStats;

      return {
        account_id: b.account_id,
        battle_life_time: b.battle_life_time - a.battle_life_time,
        frags: b.frags === null || a.frags === null ? null : b.frags - a.frags,
        in_garage: b.in_garage,
        in_garage_updated: b.in_garage_updated,
        last_battle_time: b.last_battle_time,
        mark_of_mastery: b.mark_of_mastery,
        max_frags: b.max_frags,
        max_xp: b.max_xp,
        tank_id: b.tank_id,

        all: {
          battles: b.all.battles - a.all.battles,
          capture_points: b.all.capture_points - a.all.capture_points,
          damage_dealt: b.all.damage_dealt - a.all.damage_dealt,
          damage_received: b.all.damage_received - a.all.damage_received,
          dropped_capture_points:
            b.all.dropped_capture_points - a.all.dropped_capture_points,
          frags: b.all.frags - a.all.frags,
          frags8p: b.all.frags8p - a.all.frags8p,
          hits: b.all.hits - a.all.hits,
          losses: b.all.losses - a.all.losses,
          max_frags: b.all.max_frags,
          max_xp: b.all.max_xp,
          shots: b.all.shots - a.all.shots,
          spotted: b.all.spotted - a.all.spotted,
          survived_battles: b.all.survived_battles - a.all.survived_battles,
          xp: b.all.xp - a.all.xp,
          win_and_survived: b.all.win_and_survived - a.all.win_and_survived,
          wins: b.all.wins - a.all.wins,
        },
      } satisfies IndividualTankStats;
    })
    .filter((a) => a !== null && a.all.battles > 0) as IndividualTankStats[];
}
