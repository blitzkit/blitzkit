import { isEqual } from "lodash-es";
import { useMemo } from "react";
import { api } from "../../api/dynamic";
import { withLocale } from "../../hocs/withLocale";
import { useMounted } from "../../hooks/useMounted";
import { useStrings } from "../../hooks/useStrings";
import { TankFilters } from "../../stores/tankFilters";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { TankSort } from "../../stores/tankopediaSort";
import { TankCard } from "../TankCard";
import { TankCardSkeleton } from "../TankCardSkeleton";
import { MAX_RECENTLY_VIEWED } from "../TankSearchResults/constants";
import { Text } from "../Text";
import styles from "./index.module.css";

const tankDefinitions = await api.tanks();

export const RecentlyViewedTanks = withLocale(Content);

function Content() {
  const mounted = useMounted();
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

  const strings = useStrings();
  const by = TankSort.use((state) => state.by);

  if (by !== null || hasFilters) {
    return null;
  }

  return (
    <div className={styles.recent}>
      <Text color="gray" lowContrast className={styles.label}>
        {strings.website.common.tank_search.recent}
      </Text>

      <div
        className={styles.list}
        data-empty={mounted && recentlyViewed.length === 0}
      >
        {!mounted &&
          Array.from({ length: MAX_RECENTLY_VIEWED }, (_, index) => (
            <TankCardSkeleton compact key={index} />
          ))}

        {mounted && recentlyViewed.length === 0 && (
          <>
            <TankCardSkeleton compact className={styles.placeholder} />

            <Text color="gray" lowContrast className={styles.message}>
              {strings.website.common.tank_search.recent_empty}
            </Text>
          </>
        )}

        {mounted &&
          recentlyViewed.map((id) => (
            <TankCard compact tank={tankDefinitions.tanks[id]} key={id} />
          ))}
      </div>
    </div>
  );
}
