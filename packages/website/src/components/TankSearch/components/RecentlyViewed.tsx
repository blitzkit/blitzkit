import { Flex, Separator, Text } from "@radix-ui/themes";
import { isEqual } from "lodash-es";
import { useMemo } from "react";
import { awaitableTankDefinitions } from "../../../core/awaitables/tankDefinitions";
import { useLocale } from "../../../hooks/useLocale";
import { TankFilters } from "../../../stores/tankFilters";
import { TankopediaPersistent } from "../../../stores/tankopediaPersistent";
import { TankSort } from "../../../stores/tankopediaSort";
import { TankCard } from "../../TankCard";
import { TankCardWrapper } from "./TankCardWrapper";

const tankDefinitions = await awaitableTankDefinitions;

export function RecentlyViewed() {
  const tankopediaPersistentStore = TankopediaPersistent.useStore();
  const filters = TankFilters.use();
  // non-reactive because it is a little weird that it updates instantly even before the page loads
  const recentlyViewed = tankopediaPersistentStore
    .getState()
    .recentlyViewed.filter((id) => id in tankDefinitions.tanks);
  const hasFilters = useMemo(
    () =>
      Object.entries(filters).some(([key, value]) => {
        return !isEqual(
          value,
          TankFilters.initial[key as keyof typeof TankFilters.initial]
        );
      }),
    [filters]
  );
  const { strings } = useLocale();
  const by = TankSort.use((state) => state.by);

  if (recentlyViewed.length === 0 || by !== "meta.none" || hasFilters) {
    return null;
  }

  return (
    <Flex direction="column" gap="2" mt="2" mb="6">
      <Text color="gray" align="center">
        {strings.website.common.tank_search.recent}
      </Text>
      <TankCardWrapper>
        {recentlyViewed.map((id) => (
          <TankCard tank={tankDefinitions.tanks[id]} key={id} />
        ))}
      </TankCardWrapper>

      <Separator size="4" />
    </Flex>
  );
}
