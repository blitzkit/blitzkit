import { type TankDefinition, tankIcon, TankType } from "@blitzkit/core";
import { Box, Flex } from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { classIcons } from "./ClassIcon";
import { ExperimentIcon } from "./ExperimentIcon";
import { LinkI18n } from "./LinkI18n";
import { StickyRowHeaderCell } from "./StickyRowHeaderCell";

interface TankRowHeaderCellProps {
  tank: TankDefinition;
}

export function TankRowHeaderCell({ tank }: TankRowHeaderCellProps) {
  const { locale, unwrap } = useLocale();
  const Icon = classIcons[tank.class];

  return (
    <StickyRowHeaderCell style={{ overflow: "hidden" }}>
      <LinkI18n
        locale={locale}
        color={
          tank.type === TankType.COLLECTOR
            ? "blue"
            : tank.type === TankType.PREMIUM
              ? "amber"
              : "gray"
        }
        highContrast={tank.type === TankType.RESEARCHABLE}
        underline="hover"
        wrap="nowrap"
        href={`/tanks/${tank.slug}`}
        style={{ height: "100%" }}
        size={{ initial: "1", sm: "2" }}
      >
        <Flex height="100%" align="center" gap="1">
          <Box
            draggable={false}
            height="calc(100% + 2 * var(--table-cell-padding))"
            style={{
              aspectRatio: "4 / 3",
              backgroundImage: `url(${tankIcon(tank.id)})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          <Icon
            width="1em"
            height="1em"
            style={{ minWidth: "1em", minHeight: "1em" }}
          />

          {tank.testing && (
            <ExperimentIcon style={{ width: "1em", height: "1em" }} />
          )}

          {unwrap(tank.name)}
        </Flex>
      </LinkI18n>
    </StickyRowHeaderCell>
  );
}
