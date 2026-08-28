import { alias, TankType, type TankDefinition } from "@blitzkit/core";
import { uniq } from "lodash-es";
import { type ReactNode } from "react";
import { api } from "../../core/blitzkit/api";
import { useLocale } from "../../hooks/useLocale";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { classIcons } from "../ClassIcon";
import { Flex } from "../Flex";
import { LinkI18nWrapper } from "../LinkI18nWrapper";
import { MAX_RECENTLY_VIEWED } from "../TankSearch/constants";
import { Text, type TextProps } from "../Text";
import styles from "./index.module.css";

type TankCardProps = TextProps & {
  tank: TankDefinition;
  onTankSelect?: (tank: TankDefinition) => void;
  discriminator?: ReactNode;
  noLink?: boolean;
};

const tankDefinitions = await api.tankDefinitions();

export const TankCard = ({
  tank,
  discriminator,
  onTankSelect: onSelect,
  noLink,
  style,
  ...props
}: TankCardProps) => {
  const { unwrap, locale } = useLocale();

  const provideLink = !noLink && onSelect === undefined;
  const name = unwrap(tank.name!);

  const color: TextProps["color"] =
    tank.type === TankType.TANK_TYPE_COLLECTOR
      ? "blue"
      : tank.type === TankType.TANK_TYPE_PREMIUM
        ? "amber"
        : "gray";
  const lowContrast = tank.type !== TankType.TANK_TYPE_RESEARCHABLE;

  const Icon = classIcons[tank.class];

  const content = (
    <Flex
      column
      gap="3"
      onClick={() => {
        onSelect?.(tank);
        TankopediaPersistent.mutate((draft) => {
          draft.recentlyViewed = uniq([tank.id, ...draft.recentlyViewed])
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
            `/flags/scratched/${tank.nation}.webp`,
          )})`,
        }}
      >
        <img
          alt={name}
          src={alias("api", `/tanks/${tank.id}/icons/big.webp`)}
        />
      </Flex>

      <Text color={color} lowContrast={lowContrast}>
        <Flex align="center" gap="2" justify="center">
          <Icon className={styles.icon} />
          {name}
        </Flex>
      </Text>

      {discriminator && (
        <Text lowContrast align="center">
          {discriminator}
        </Text>
      )}
    </Flex>
  );

  if (provideLink) {
    return (
      <LinkI18nWrapper locale={locale} href={`/tanks/${tank.slug}`}>
        {content}
      </LinkI18nWrapper>
    );
  }

  return content;
};
