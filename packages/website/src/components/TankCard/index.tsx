import { alias, TankType, type TankDefinition } from "@blitzkit/core";
import { uniq } from "lodash-es";
import { type ReactNode } from "react";
import { api } from "../../blitzkit/api";
import { useLocale } from "../../hooks/useLocale";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { classIcons } from "../ClassIcon";
import { Flex } from "../Flex";
import { LinkI18nWrapper } from "../LinkI18nWrapper";
import { TankCardSkeleton } from "../TankCardSkeleton";
import { MAX_RECENTLY_VIEWED } from "../TankSearch/constants";
import { Text, type TextProps } from "../Text";
import styles from "./index.module.css";

type TankCardProps = {
  tank: TankDefinition;
  onTankSelect?: (tank: TankDefinition) => void;
  discriminator?: ReactNode;
  noLink?: boolean;
  compact?: boolean;
};

const tankDefinitions = await api.tanks();

export const TankCard = (props: MaybeSkeletonComponentProps<TankCardProps>) => {
  if (props.skeleton) {
    return <TankCardSkeleton />;
  }

  const { unwrap, locale } = useLocale();

  const provideLink = !props.noLink && props.onTankSelect === undefined;
  const name = unwrap(props.tank.name!);

  const color: TextProps["color"] =
    props.tank.type === TankType.TANK_TYPE_COLLECTOR
      ? "blue"
      : props.tank.type === TankType.TANK_TYPE_PREMIUM
        ? "amber"
        : "gray";
  const lowContrast = props.tank.type !== TankType.TANK_TYPE_RESEARCHABLE;

  const Icon = classIcons[props.tank.class];

  const content = (
    <Flex
      className={styles.wrapper}
      data-compact={props.compact}
      column
      gap="3"
      onClick={() => {
        props.onTankSelect?.(props.tank);
        TankopediaPersistent.mutate((draft) => {
          draft.recentlyViewed = uniq([props.tank.id, ...draft.recentlyViewed])
            .filter((id) => id in tankDefinitions.tanks)
            .slice(0, MAX_RECENTLY_VIEWED);
        });
      }}
    >
      <Flex
        justify="end"
        className={styles["image-wrapper"]}
        style={{
          backgroundImage: `url(${alias(
            "api",
            `/flags/scratched/${props.tank.nation}.webp`,
          )})`,
        }}
      >
        <img
          alt={name}
          src={alias("api", `/tanks/${props.tank.id}/icons/big.webp`)}
        />
      </Flex>

      <Text className={styles.name} color={color} lowContrast={lowContrast}>
        <Icon className={styles.icon} />
        <span className={styles.text}>{name}</span>
      </Text>

      {props.discriminator && (
        <Text lowContrast align="center">
          {props.discriminator}
        </Text>
      )}
    </Flex>
  );

  if (provideLink) {
    return (
      <LinkI18nWrapper locale={locale} href={`/tanks/${props.tank.slug}`}>
        {content}
      </LinkI18nWrapper>
    );
  }

  return content;
};
