import { TankDefinition, formatCompact } from "@blitzkit/core";
import { Table } from "@radix-ui/themes";
import { memo } from "react";
import { awaitableAverageDefinitions } from "../../core/awaitables/averageDefinitions";
import { useAveragesExclusionRatio } from "../../hooks/useAveragesExclusionRatio";
import { useLocale } from "../../hooks/useLocale";
import { Performance } from "../../stores/performance";
import { CompareCell, CompareCellDirection } from "../CompareCell";
import { TankRowHeaderCell } from "../TankRowHeaderCell";

interface TankRowProps {
  tank: TankDefinition;
  average: Record<string, number>;
}

const averageDefinitions = await awaitableAverageDefinitions;

export const TankRow = memo<TankRowProps>(
  ({ tank, average }) => {
    const averages = averageDefinitions.averages[tank.id];
    const ratio = useAveragesExclusionRatio();
    const playerCountPeriod = Performance.use(
      (state) => state.playerCountPeriod
    );
    const { locale } = useLocale();

    return (
      <Table.Row>
        <TankRowHeaderCell tank={tank} />

        <CompareCell
          value={averages.mu.wins / averages.mu.battles}
          truth={average.winrate}
          align="center"
        >
          {((averages.mu.wins / averages.mu.battles) * 100).toFixed(1)}%
        </CompareCell>
        <Table.Cell align="center">
          {formatCompact(
            locale,
            Math.round(ratio * averages.samples[playerCountPeriod])
          )}
        </Table.Cell>
        <CompareCell
          value={averages.mu.damage_dealt / averages.mu.battles}
          truth={average.damage}
          align="center"
        >
          {Math.round(
            averages.mu.damage_dealt / averages.mu.battles
          ).toLocaleString(locale)}
        </CompareCell>
        <CompareCell
          value={averages.mu.survived_battles / averages.mu.battles}
          truth={average.survival}
          align="center"
        >
          {Math.round(
            (averages.mu.survived_battles / averages.mu.battles) * 100
          )}
          %
        </CompareCell>
        <CompareCell
          value={averages.mu.xp / averages.mu.battles}
          truth={average.xp}
          align="center"
        >
          {Math.round(averages.mu.xp / averages.mu.battles).toLocaleString(
            locale
          )}
        </CompareCell>
        <CompareCell
          value={averages.mu.frags / averages.mu.battles}
          truth={average.kills}
          align="center"
        >
          {(averages.mu.frags / averages.mu.battles).toFixed(2)}
        </CompareCell>
        <CompareCell
          value={averages.mu.spotted / averages.mu.battles}
          truth={average.spots}
          align="center"
        >
          {(averages.mu.spotted / averages.mu.battles).toFixed(2)}
        </CompareCell>
        <CompareCell
          value={averages.mu.hits / averages.mu.shots}
          truth={average.accuracy}
          align="center"
        >
          {Math.round((averages.mu.hits / averages.mu.shots) * 100)}%
        </CompareCell>
        <CompareCell
          value={averages.mu.shots / averages.mu.battles}
          truth={average.shots}
          align="center"
        >
          {(averages.mu.shots / averages.mu.battles).toFixed(1)}
        </CompareCell>
        <CompareCell
          value={averages.mu.hits / averages.mu.battles}
          truth={average.hits}
          align="center"
        >
          {(averages.mu.hits / averages.mu.battles).toFixed(1)}
        </CompareCell>
        <CompareCell
          value={averages.mu.damage_dealt / averages.mu.damage_received}
          truth={average.damageRatio}
          align="center"
        >
          {(averages.mu.damage_dealt / averages.mu.damage_received).toFixed(2)}
        </CompareCell>
        <CompareCell
          value={averages.mu.damage_received / averages.mu.battles}
          truth={average.damageReceived}
          direction={CompareCellDirection.LOWER_IS_BETTER}
          align="center"
        >
          {Math.round(
            averages.mu.damage_received / averages.mu.battles
          ).toLocaleString(locale)}
        </CompareCell>
        <CompareCell
          value={averages.mu.capture_points / averages.mu.battles}
          truth={average.capturePoints}
          align="center"
        >
          {(averages.mu.capture_points / averages.mu.battles).toFixed(2)}
        </CompareCell>
      </Table.Row>
    );
  },
  (prev, next) => prev.tank.id === next.tank.id
);
