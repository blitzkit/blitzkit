import {
  asset,
  fetchTankDefinitions,
  TankType,
  type TankDefinition,
} from "@blitzkit/core";
import { Flex, Text, type TextProps } from "@radix-ui/themes";
import { uniq } from "lodash-es";
import { forwardRef, type ReactNode } from "react";
import { useLocale } from "../../hooks/useLocale";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { classIcons } from "../ClassIcon";
import { LinkI18n } from "../LinkI18n";
import { MAX_RECENTLY_VIEWED } from "../TankSearch/constants";
import "./index.css";

type TankCardProps = TextProps & {
  tank: TankDefinition;
  onTankSelect?: (tank: TankDefinition) => void;
  discriminator?: ReactNode;
  noLink?: boolean;
};

const tankDefinitions = await fetchTankDefinitions();

export const TankCard = forwardRef<HTMLSpanElement, TankCardProps>(
  (
    {
      tank,
      discriminator,
      onTankSelect: onSelect,
      noLink,
      style,
      ...props
    }: TankCardProps,
    ref
  ) => {
    const { unwrap, locale } = useLocale();
    const provideLink = !noLink && onSelect === undefined;

    const Icon = classIcons[tank.class];

    return (
      <Text
        ref={ref}
        tabIndex={onSelect ? 0 : undefined}
        size="2"
        color={
          tank.type === TankType.COLLECTOR
            ? "blue"
            : tank.type === TankType.PREMIUM
              ? "amber"
              : "gray"
        }
        highContrast={tank.type === TankType.RESEARCHABLE}
        onClick={() => {
          onSelect?.(tank);
          TankopediaPersistent.mutate((draft) => {
            draft.recentlyViewed = uniq([tank.id, ...draft.recentlyViewed])
              .filter((id) => id in tankDefinitions.tanks)
              .slice(0, MAX_RECENTLY_VIEWED);
          });
        }}
        className="tank-search-card"
        data-provide-link={provideLink}
        style={{
          backgroundImage: `url(${asset(`flags/scratched/${tank.nation}.webp`)})`,
          ...style,
        }}
        {...props}
      >
        <LinkI18n
          locale={locale}
          className="link"
          underline="hover"
          href={provideLink ? `/tanks/${tank.slug}` : "#"}
          onClick={(event) => {
            if (!provideLink) event.preventDefault();
          }}
        >
          <img
            alt={unwrap(tank.name)}
            src={asset(`icons/tanks/big/${tank.id}.webp`)}
            className="image"
            draggable={false}
          />

          <Flex
            justify="center"
            gap="1"
            align="center"
            overflow="hidden"
            width="100%"
            mt="1"
          >
            <Icon className="class-icon" />
            <Text align="center" className="name">
              {unwrap(tank.name)}
            </Text>
          </Flex>

          {discriminator && (
            <Text
              color="gray"
              align="center"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {discriminator}
            </Text>
          )}
        </LinkI18n>
      </Text>
    );
  }
);
