import {
  asset,
  fetchAverageDefinitions,
  fetchTankDefinitions,
  formatCompact,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import { Box, Flex, Link, Text } from '@radix-ui/themes';
import { TankopediaEphemeral } from '../../../../stores/tankopediaEphemeral';

interface NodeProps {
  id: number;
  nextIds?: number[];
  highlight?: boolean;
}

const tankDefinitions = await fetchTankDefinitions();
const averageDefinitions = await fetchAverageDefinitions();

export function Node({ id, highlight, nextIds }: NodeProps) {
  const xpMultiplier = TankopediaEphemeral.use((state) => state.xpMultiplier);
  const tank = tankDefinitions.tanks[id];
  const nextTanks = nextIds?.map((id) => tankDefinitions.tanks[id]);
  const thisTankXp =
    tank.researchCost === undefined || tank.tier === 1
      ? 0
      : (tank.researchCost.researchCostType!.value as number)! / xpMultiplier;
  const nextTanksXp = nextTanks?.reduce(
    (xp, tank) =>
      xp +
      (tank.researchCost === undefined || tank.tier === 1
        ? 0
        : (tank.researchCost.researchCostType!.value as number) / xpMultiplier),
    0,
  );
  const averages = averageDefinitions.averages[tank.id]?.mu;
  const averageXp = averages ? averages.xp / averages.battles : undefined;
  const games =
    averages && nextTanks ? Math.round(nextTanksXp! / averageXp!) : undefined;

  return (
    <Link
      href={`/tools/tankopedia/${id}`}
      key={id}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
      }}
    >
      <Box
        mx={highlight ? '2' : '0'}
        style={{
          background: highlight
            ? `url(${asset(`flags/fade_small/${tank.nation}.webp`)})`
            : undefined,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          boxShadow: highlight ? 'var(--shadow-4)' : undefined,
          borderRadius: 'var(--radius-4)',
          overflow: 'hidden',
        }}
      >
        <Flex
          direction="column"
          align="center"
          py="4"
          px={highlight ? '4' : '2'}
          style={{
            backdropFilter: highlight ? 'brightness(0.25)' : undefined,
            WebkitBackdropFilter: highlight ? 'brightness(0.25)' : undefined,
          }}
        >
          <img
            alt={tank.name}
            src={asset(`icons/tanks/big/${id}.webp`)}
            width={64}
            height={64}
            style={{
              objectFit: 'contain',
            }}
          />

          <Flex direction="column" align="center">
            <Flex gap="2" align="center">
              <Text color="gray" size="1">
                {TIER_ROMAN_NUMERALS[tank.tier]}
              </Text>
              <Text wrap="nowrap">{tank.name}</Text>
            </Flex>
            <Flex gap="2" align="center">
              <Text color="gray" size="1" wrap="nowrap">
                <Flex gap="1" align="center">
                  <img
                    alt="XP"
                    src={asset('icons/currencies/xp.webp')}
                    style={{
                      width: '1em',
                      height: '1em',
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                  />
                  {formatCompact(thisTankXp)}
                </Flex>
              </Text>
              <Text color="gray" size="1" wrap="nowrap">
                <Flex gap="1" align="center">
                  <img
                    alt="Silver"
                    src={asset('icons/currencies/silver.webp')}
                    style={{
                      width: '1em',
                      height: '1em',
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                  />
                  {formatCompact(tank.price.value)}
                </Flex>
              </Text>
            </Flex>

            {averages && nextTanks && (
              <Text color="gray" size="1" mt="2">
                {games!} {games === 1 ? 'battle' : 'battles'}
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>
    </Link>
  );
}
