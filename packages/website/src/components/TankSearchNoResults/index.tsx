import { useLocale } from "../../hooks/useLocale";
import { TankFilters } from "../../stores/tankFilters";
import { Flex } from "../Flex";
import { Link } from "../Link";
import { Text } from "../Text";
import styles from "./index.module.css";

interface NoResultsProps {
  type?: "filters" | "search";
}

export function TankSearchNoResults({ type = "filters" }: NoResultsProps) {
  const { strings } = useLocale();

  return (
    <Flex className={styles["no-results"]} align="center" justify="center">
      <Text lowContrast>
        {strings.website.common.tank_search.no_tanks_found.body}{" "}
        <Link
          underline="always"
          color="red"
          onClick={() => {
            TankFilters.set(TankFilters.initial);
          }}
        >
          {type === "filters"
            ? strings.website.common.tank_search.no_tanks_found.clear_filters
            : strings.website.common.tank_search.no_tanks_found.search_again}
        </Link>
      </Text>
    </Flex>
  );
}
