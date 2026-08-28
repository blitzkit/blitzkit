import { isEqual } from "lodash-es";
import { useMemo } from "react";
import { api } from "../../core/blitzkit/api";
import { useLocale } from "../../hooks/useLocale";
import { TankFilters } from "../../stores/tankFilters";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { TankSort } from "../../stores/tankopediaSort";
import { Flex } from "../Flex";
import { TankCard } from "../TankCard";
import { TankCardWrapper } from "../TankCardWrapper";
import { Text } from "../Text";
import styles from "./index.module.css";

const tankDefinitions = await api.tankDefinitions();

export function RecentlyViewedTanks() {
  const filters = TankFilters.use();
  // non-reactive because it is a little weird that it updates instantly even before the page loads
  const recentlyViewed = TankopediaPersistent.state.recentlyViewed.filter(
    (id) => id in tankDefinitions.tanks,
  );
  const hasFilters = useMemo(
    () =>
      Object.entries(filters).some(([key, value]) => {
        return !isEqual(
          value,
          TankFilters.initial[key as keyof typeof TankFilters.initial],
        );
      }),
    [filters],
  );
  const { strings } = useLocale();
  const by = TankSort.use((state) => state.by);

  if (recentlyViewed.length === 0 || by !== "meta.none" || hasFilters) {
    return null;
  }

  return (
    <Flex column gap="4" className={styles.recent}>
      <Text color="gray" lowContrast>
        {strings.website.common.tank_search.recent}
      </Text>

      <TankCardWrapper compact>
        {recentlyViewed.map((id) => (
          <TankCard compact tank={tankDefinitions.tanks[id]} key={id} />
        ))}
      </TankCardWrapper>
    </Flex>
  );
}
