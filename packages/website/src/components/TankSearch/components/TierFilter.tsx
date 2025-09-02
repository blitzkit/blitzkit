import { TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { Flex, IconButton, Text } from "@radix-ui/themes";
import { times } from "lodash-es";
import { memo } from "react";
import { TankFilters } from "../../../stores/tankFilters";
import { TankSort } from "../../../stores/tankopediaSort";

export const TierFilter = memo(() => {
  const by = TankSort.use((state) => state.by);
  const search = TankFilters.use((state) => state.search);
  const tiers = TankFilters.use((state) => state.tiers);

  if (by !== "meta.none" || search) return null;

  return (
    <Flex justify="center">
      <Flex
        direction="row"
        overflow="hidden"
        style={{ borderRadius: "var(--radius-full)" }}
      >
        {times(10, (index) => {
          const tier = 10 - index;
          const selected = tiers.includes(tier);

          return (
            <IconButton
              key={tier}
              variant={selected ? "solid" : "soft"}
              radius="none"
              color={selected ? undefined : "gray"}
              highContrast
              onClick={() => {
                TankFilters.mutate((draft) => {
                  if (tiers.includes(tier)) {
                    draft.tiers = tiers.filter((t) => t !== tier);
                  } else {
                    draft.tiers = [...tiers, tier];
                  }
                });
              }}
            >
              <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
            </IconButton>
          );
        })}
      </Flex>
    </Flex>
  );
});
