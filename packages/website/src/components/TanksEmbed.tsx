import {
  formatCompositeStat,
  TankClass,
  TankDefinition,
  TankType,
  type CompositeStats,
  type CompositeStatsKey,
} from "@blitzkit/core";
import strings from "@blitzkit/i18n/strings/en.json";
import { amberDark, blueDark } from "@radix-ui/colors";
import { Flex, Text, type FlexProps } from "@radix-ui/themes";
import { times } from "lodash-es";
import type { ReactNode } from "react";
import { breakdownConfig } from "../constants/embeds";
import { toRadiusVar } from "../core/radix/utils";
import { useLocale } from "../hooks/useLocale";
import { useEmbedStateCurry } from "../stores/embedState/utilities";
import { ClassHeavy } from "./ClassIcon/components/ClassHeavy";
import { ClassLight } from "./ClassIcon/components/ClassLight";
import { ClassMedium } from "./ClassIcon/components/ClassMedium";
import { ClassTankDestroyer } from "./ClassIcon/components/ClassTankDestroyer";

type BreakdownEmbedWrapperProps = FlexProps & {
  children: ReactNode;
};

export function BreakdownEmbedWrapper({
  children,
  ...props
}: BreakdownEmbedWrapperProps) {
  const { useEmbedState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <Flex
      direction="column"
      gap={useEmbedState("listGap")}
      height="100%"
      {...props}
    >
      {children}
    </Flex>
  );
}

interface BreakdownEmbedCardProps {
  tank: TankDefinition | null | undefined;
  composite: CompositeStats;
}

export function BreakdownEmbedCard({
  tank,
  composite,
}: BreakdownEmbedCardProps) {
  const { useEmbedState, useRichText } =
    useEmbedStateCurry<typeof breakdownConfig>();
  const { unwrap } = useLocale();

  return (
    <Flex
      flexShrink="0"
      direction="column"
      style={{
        borderRadius: toRadiusVar(useEmbedState("cardRadius")),
        overflow: "hidden",
        backgroundColor: useEmbedState("cardBodyBackgroundColor"),
      }}
    >
      <Flex
        justify="center"
        style={{
          backgroundColor: useEmbedState("cardHeaderBackgroundColor"),
        }}
        p={useEmbedState("cardHeaderPadding")}
      >
        <Text
          {...{
            ...useRichText("cardTitle"),
            style:
              tank === null
                ? undefined
                : tank === undefined ||
                    tank.type === TankType.TANK_TYPE_RESEARCHABLE ||
                    !useEmbedState("cardTitleTypeColor")
                  ? undefined
                  : {
                      color:
                        tank.type === TankType.TANK_TYPE_PREMIUM
                          ? amberDark.amber11
                          : blueDark.blue11,
                    },
          }}
        >
          <Flex align="center" gap="1">
            {useEmbedState("cardTitleClassIcon") &&
              tank !== null &&
              tank !== undefined && (
                <>
                  {tank.class === TankClass.TANK_CLASS_LIGHT && (
                    <ClassLight width="1em" height="1em" />
                  )}
                  {tank.class === TankClass.TANK_CLASS_MEDIUM && (
                    <ClassMedium width="1em" height="1em" />
                  )}
                  {tank.class === TankClass.TANK_CLASS_HEAVY && (
                    <ClassHeavy width="1em" height="1em" />
                  )}
                  {tank.class === TankClass.TANK_CLASS_TANK_DESTROYER && (
                    <ClassTankDestroyer width="1em" height="1em" />
                  )}
                </>
              )}{" "}
            {tank === null
              ? "Total"
              : tank === undefined
                ? `Unknown tank`
                : unwrap(tank.name!)}
          </Flex>
        </Text>
      </Flex>

      <Flex p={useEmbedState("cardBodyPadding")}>
        {times(4, (index) => {
          const column = (index + 1) as 1 | 2 | 3 | 4;
          const statKey = useEmbedState(`column${column}`) as CompositeStatsKey;
          const customLabel = useEmbedState(`column${column}CustomLabel`);

          return (
            <Flex
              key={column}
              direction="column"
              align="center"
              gap={useEmbedState("columnGap")}
              flexGrow="1"
            >
              <Text {...useRichText("columnValue")}>
                {formatCompositeStat(composite[statKey], statKey, composite)}
              </Text>
              <Text {...useRichText("columnLabel")}>
                {customLabel.length === 0
                  ? strings.common.composite_stats[statKey]
                  : customLabel}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
