import { asset, formatCompact, TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import { Box, Flex, Skeleton, Text } from "@radix-ui/themes";
import { awaitableAverageDefinitions } from "../../../../core/awaitables/averageDefinitions";
import { awaitableTankDefinitions } from "../../../../core/awaitables/tankDefinitions";
import { useLocale } from "../../../../hooks/useLocale";
import { Tankopedia } from "../../../../stores/tankopedia";
import type { MaybeSkeletonComponentProps } from "../../../../types/maybeSkeletonComponentProps";
import { LinkI18n } from "../../../LinkI18n";

type NodeProps = MaybeSkeletonComponentProps & {
  id: number;
  nextIds?: number[];
  highlight?: boolean;
};

const [tankDefinitions, averageDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableAverageDefinitions,
]);

export function Node({ id, highlight, nextIds, skeleton }: NodeProps) {
  const { locale, strings, unwrap } = useLocale();
  const xpMultiplier = Tankopedia.use((state) => state.xpMultiplier);
  const tank = tankDefinitions.tanks[id];
  const nextTanks = nextIds?.map((id) => tankDefinitions.tanks[id]);
  const thisTankXp =
    tank.research_cost === undefined || tank.tier === 1
      ? 0
      : (tank.research_cost.research_cost_type!.value as number)! /
        xpMultiplier;
  const nextTanksXp = nextTanks?.reduce(
    (xp, tank) =>
      xp +
      (tank.research_cost === undefined || tank.tier === 1
        ? 0
        : (tank.research_cost.research_cost_type!.value as number) /
          xpMultiplier),
    0
  );
  const averages = averageDefinitions.averages[tank.id]?.mu;
  const averageXp = averages ? averages.xp / averages.battles : undefined;
  const games =
    averages && nextTanks ? Math.round(nextTanksXp! / averageXp!) : undefined;

  return (
    <LinkI18n
      locale={locale}
      href={`/tanks/${tankDefinitions.tanks[id].slug}`}
      key={id}
      style={{
        textDecoration: "none",
        color: "inherit",
        position: "relative",
      }}
    >
      <Box
        mx={highlight ? "2" : "0"}
        style={{
          background: highlight
            ? `url(${asset(`flags/fade_small/${tank.nation}.webp`)})`
            : undefined,
          backgroundPosition: "center",
          backgroundSize: "cover",
          boxShadow: highlight ? "var(--shadow-4)" : undefined,
          borderRadius: "var(--radius-4)",
          overflow: "hidden",
        }}
      >
        <Flex
          direction="column"
          align="center"
          py="4"
          px={highlight ? "4" : "2"}
          style={{
            backdropFilter: highlight ? "brightness(0.25)" : undefined,
            WebkitBackdropFilter: highlight ? "brightness(0.25)" : undefined,
          }}
        >
          <img
            alt={unwrap(tank.name)}
            src={asset(`icons/tanks/big/${id}.webp`)}
            width={64}
            height={64}
            style={{
              objectFit: "contain",
            }}
          />

          <Flex direction="column" align="center">
            <Flex gap="2" align="center">
              <Text color="gray" size="1">
                {TIER_ROMAN_NUMERALS[tank.tier]}
              </Text>
              <Text wrap="nowrap">{unwrap(tank.name)}</Text>
            </Flex>
            <Flex gap="2" align="center">
              <Text color="gray" size="1" wrap="nowrap">
                <Flex gap="1" align="center">
                  <img
                    alt="XP"
                    src={asset("icons/currencies/xp.webp")}
                    style={{
                      width: "1em",
                      height: "1em",
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  />
                  {formatCompact(locale, thisTankXp)}
                </Flex>
              </Text>
              <Text color="gray" size="1" wrap="nowrap">
                <Flex gap="1" align="center">
                  <img
                    alt="Silver"
                    src={asset("icons/currencies/silver.webp")}
                    style={{
                      width: "1em",
                      height: "1em",
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  />
                  {formatCompact(locale, tank.price.value)}
                </Flex>
              </Text>
            </Flex>

            {averages && nextTanks && tank.tier !== 10 && (
              <Text color="gray" size="1" mt="2">
                {skeleton && <Skeleton height="1em" width="4em" />}
                {!skeleton &&
                  (games === 1
                    ? strings.website.tools.tankopedia.tech_tree.battle
                    : literals(
                        strings.website.tools.tankopedia.tech_tree.battles,
                        [`${games}`]
                      ))}
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>
    </LinkI18n>
  );
}
