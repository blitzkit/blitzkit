import { Heading } from '@radix-ui/themes';
import { useLocale } from '../../../../../../hooks/useLocale';
import { Info } from './Info';
import { InfoWithDelta } from './InfoWithDelta';
import { StatsTableWrapper } from './StatsTableWrapper';
import type { StatsAcceptorProps } from './TraverseVisualizer';
import { ViewRangeVisualizer } from './ViewRangeVisualizer';

export function Survivability({ stats }: StatsAcceptorProps) {
  const { strings } = useLocale();

  return (
    <StatsTableWrapper>
      <Heading size="5">
        {strings.website.tools.tankopedia.survivability.title}
      </Heading>
      <InfoWithDelta value="health" stats={stats} decimals={0} />
      <InfoWithDelta
        stats={stats}
        name={
          strings.website.tools.tankopedia.characteristics.values.fireChance
        }
        deltaType="lowerIsBetter"
        decimals={0}
        value={(stats) => stats.fireChance * 100}
      />
      {stats.trackRepairTime !== undefined && (
        <InfoWithDelta
          value="trackRepairTime"
          stats={stats}
          deltaType="lowerIsBetter"
          decimals={2}
        />
      )}
      <InfoWithDelta value="viewRange" stats={stats} decimals={0} />
      <ViewRangeVisualizer stats={stats} />
      <Info
        name={
          strings.website.tools.tankopedia.characteristics.values.camouflage
        }
      />
      <InfoWithDelta
        value={(stats) => stats.camouflageStill * 100}
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageStill
        }
        decimals={2}
      />
      <InfoWithDelta
        value={(stats) => stats.camouflageMoving * 100}
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageMoving
        }
        decimals={2}
      />
      <InfoWithDelta
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageShootingStill
        }
        decimals={2}
        value={(stats) => stats.camouflageShootingStill * 100}
      />
      <InfoWithDelta
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageShootingMoving
        }
        decimals={2}
        value={(stats) => stats.camouflageShootingMoving * 100}
      />
      <InfoWithDelta
        stats={stats}
        indent
        name={
          strings.website.tools.tankopedia.characteristics.values
            .camouflageCaughtOnFire
        }
        decimals={2}
        value={(stats) => stats.camouflageCaughtOnFire * 100}
      />
      <InfoWithDelta
        decimals={2}
        deltaType="lowerIsBetter"
        stats={stats}
        value="width"
      />
      <InfoWithDelta
        decimals={2}
        deltaType="lowerIsBetter"
        stats={stats}
        value="height"
      />
      <InfoWithDelta
        decimals={2}
        deltaType="lowerIsBetter"
        stats={stats}
        value="length"
      />
      <InfoWithDelta
        decimals={2}
        deltaType="lowerIsBetter"
        stats={stats}
        value="volume"
      />
    </StatsTableWrapper>
  );
}
