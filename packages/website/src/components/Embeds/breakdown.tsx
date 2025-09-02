import {
  calculateCompositeStats,
  compositeStats,
  compositeStatsKeys,
  deltaTankStats,
  getTankStats,
  idToRegion,
  sumCompositeStats,
  type IndividualTankStats,
} from "@blitzkit/core";
import { STRINGS } from "@blitzkit/i18n";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ContextMenu } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react";
import { breakdownConfig } from "../../constants/embeds";
import { awaitableAverageDefinitions } from "../../core/awaitables/averageDefinitions";
import { awaitableTankDefinitions } from "../../core/awaitables/tankDefinitions";
import { EmbedBreakdown } from "../../stores/embedBreakdown";
import { useEmbedStateCurry } from "../../stores/embedState/utilities";
import { BreakdownEmbedCard, BreakdownEmbedWrapper } from "../TanksEmbed";

export const compositeStatsKeysOptions = compositeStatsKeys.map((value) => ({
  value,
  locales: Object.entries(STRINGS).reduce((accumulator, [locale, strings]) => {
    return {
      ...accumulator,
      [locale]: strings.common.composite_stats[value],
    };
  }, {}),
}));

const [tankDefinitions, averageDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableAverageDefinitions,
]);

export const fakeCompositeStats = compositeStats(
  {
    battle_life_time: 5 * 50 * 60,
    battles: 50,
    capture_points: 5,
    damage_dealt: 3201 * 50,
    damage_received: 1093 * 50,
    dropped_capture_points: 40,
    frags: 99,
    frags8p: 0,
    hits: 50 * 13,
    losses: 20,
    max_frags: 7,
    max_xp: 1203,
    shots: 50 * 14,
    spotted: 50 * 1.5,
    survived_battles: 32,
    win_and_survived: 28,
    wins: 30,
    xp: 1230 * 50,
  },
  averageDefinitions.averages[7297].mu
);

export function BreakdownPreview() {
  const tanks = Object.values(tankDefinitions.tanks);
  const { useEmbedState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <BreakdownEmbedWrapper>
      {useEmbedState("showTotal") && (
        <BreakdownEmbedCard composite={fakeCompositeStats} tank={null} />
      )}

      {tanks.slice(0, useEmbedState("listMaxTanks")).map((tank) => (
        <BreakdownEmbedCard
          composite={fakeCompositeStats}
          key={tank.id}
          tank={tank}
        />
      ))}
    </BreakdownEmbedWrapper>
  );
}

export function BreakdownRenderer() {
  const { useEmbedState } = useEmbedStateCurry<typeof breakdownConfig>();
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const tankStatsA = EmbedBreakdown.use((state) => state[id] ?? []);
  const [tankStatsB, setTankStatsB] = useState<IndividualTankStats[]>([]);
  const diff = useMemo(
    () =>
      deltaTankStats(tankStatsA, tankStatsB).sort(
        (a, b) => b.last_battle_time - a.last_battle_time
      ),
    [tankStatsB]
  );
  const compositeStats = diff
    .map((diff) => {
      const average = averageDefinitions.averages[diff.tank_id];

      if (average === undefined) return null;

      const compositeStats = calculateCompositeStats(
        { battle_life_time: diff.battle_life_time, ...diff.all },
        average.mu
      );

      return { id: diff.tank_id, compositeStats };
    })
    .filter((stats) => stats !== null);
  const sum = sumCompositeStats(
    compositeStats.map(({ compositeStats }) => compositeStats)
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const newB = await getTankStats(idToRegion(id), id);

      if (newB === null) return;

      setTankStatsB(newB);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <BreakdownEmbedWrapper>
          {useEmbedState("showTotal") && (
            <BreakdownEmbedCard composite={sum} tank={null} />
          )}

          {compositeStats
            .slice(0, useEmbedState("listMaxTanks"))
            .map(({ id, compositeStats }) => {
              const tank = tankDefinitions.tanks[id];

              return (
                <BreakdownEmbedCard
                  key={tank.id}
                  tank={tank}
                  composite={compositeStats}
                />
              );
            })}
        </BreakdownEmbedWrapper>
      </ContextMenu.Trigger>

      <ContextMenu.Content>
        <ContextMenu.Item
          color="red"
          onClick={async () => {
            const newA = await getTankStats(idToRegion(id), id);

            if (newA === null) return;

            EmbedBreakdown.mutate((draft) => {
              draft[id] = newA;
            });
          }}
        >
          <ReloadIcon /> Reset
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
