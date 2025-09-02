import { TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import { Flex, SegmentedControl, Text, type FlexProps } from "@radix-ui/themes";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import {
  Tankopedia,
  TankopediaRelativeAgainst,
} from "../../../../../../stores/tankopedia";

export function CompareOptions(props: FlexProps) {
  const relativeAgainst = Tankopedia.use((state) => state.relativeAgainst);
  const tank = Duel.use((state) => state.protagonist.tank);
  const { strings } = useLocale();

  return (
    <Flex
      align="center"
      gap="2"
      justify="center"
      direction={{ initial: "column", sm: "row" }}
      {...props}
    >
      <Text color="gray">
        {strings.website.tools.tankopedia.characteristics.compare.label}
      </Text>

      <SegmentedControl.Root
        variant="classic"
        size="1"
        value={`${relativeAgainst}`}
        onValueChange={(value) => {
          Tankopedia.mutate((draft) => {
            draft.relativeAgainst = Number(value) as TankopediaRelativeAgainst;
          });
        }}
      >
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.Class}`}>
          {literals(
            strings.website.tools.tankopedia.characteristics.compare.class,
            [
              TIER_ROMAN_NUMERALS[tank.tier],
              strings.common.tank_class_short_plural_lowercase[tank.class],
            ]
          )}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.Tier}`}>
          {literals(
            strings.website.tools.tankopedia.characteristics.compare.tier,
            [TIER_ROMAN_NUMERALS[tank.tier]]
          )}
        </SegmentedControl.Item>
        <SegmentedControl.Item value={`${TankopediaRelativeAgainst.All}`}>
          {strings.website.tools.tankopedia.characteristics.compare.all}
        </SegmentedControl.Item>
      </SegmentedControl.Root>
    </Flex>
  );
}
