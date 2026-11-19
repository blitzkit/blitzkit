import {
  formatCompositeStat,
  type CompositeStats,
  type CompositeStatsKey,
} from "@blitzkit/core";
import strings from "@blitzkit/i18n/strings/en.json";
import { TankClass, TankDefinition, TankType } from "@blitzkit/protos";
import { amberDark, blueDark } from "@radix-ui/colors";
import { times } from "lodash-es";
import type { ComponentProps } from "react";
import { breakdownConfig } from "../../constants/embeds";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { embedRadius, embedSpace } from "../../stores/embedState/tokens";
import { useEmbedStateCurry } from "../../stores/embedState/utilities";
import { classNames } from "../../ui/classNames";
import { ClassHeavy } from "../ClassIcon/components/ClassHeavy";
import { ClassLight } from "../ClassIcon/components/ClassLight";
import { ClassMedium } from "../ClassIcon/components/ClassMedium";
import { ClassTankDestroyer } from "../ClassIcon/components/ClassTankDestroyer";
import styles from "./index.module.css";

export function BreakdownEmbedWrapper({
  className,
  style,
  ...props
}: ComponentProps<"div">) {
  const { useEmbedState } = useEmbedStateCurry<typeof breakdownConfig>();

  return (
    <div
      className={classNames(styles.wrapper, className)}
      style={{ gap: embedSpace(useEmbedState("list_gap")), ...style }}
      {...props}
    />
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
  const unwrap = useUnwrapper();
  const titleText = useRichText("card_title");
  const cardTitleTypeColor = useEmbedState("card_title_type_color");
  const typeColored =
    tank !== null &&
    tank !== undefined &&
    tank.type !== TankType.TANK_TYPE_RESEARCHABLE &&
    cardTitleTypeColor;

  return (
    <div
      className={styles.card}
      style={{
        borderRadius: embedRadius(useEmbedState("card_radius")),
        backgroundColor: useEmbedState("card_body_background_color"),
      }}
    >
      <div
        className={styles.header}
        style={{
          backgroundColor: useEmbedState("card_header_background_color"),
          padding: embedSpace(useEmbedState("card_header_padding")),
        }}
      >
        <span
          className={styles.text}
          style={{
            ...titleText,
            ...(typeColored && {
              color:
                tank.type === TankType.TANK_TYPE_PREMIUM
                  ? amberDark.amber11
                  : blueDark.blue11,
            }),
          }}
        >
          <span className={styles.title}>
            {useEmbedState("card_title_class_icon") &&
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
          </span>
        </span>
      </div>

      <div
        className={styles.body}
        style={{ padding: embedSpace(useEmbedState("card_body_padding")) }}
      >
        {times(4, (index) => {
          const column = (index + 1) as 1 | 2 | 3 | 4;
          const statKey = useEmbedState(
            `column_${column}`
          ) as CompositeStatsKey;
          const customLabel = useEmbedState(`column_${column}_custom_label`);

          return (
            <div
              key={column}
              className={styles.column}
              style={{ gap: embedSpace(useEmbedState("column_gap")) }}
            >
              <span className={styles.text} style={useRichText("column_value")}>
                {formatCompositeStat(composite[statKey], statKey, composite)}
              </span>
              <span className={styles.text} style={useRichText("column_label")}>
                {customLabel.length === 0
                  ? strings.common.composite_stats[statKey]
                  : customLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
