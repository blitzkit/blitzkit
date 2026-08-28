import { useLocale } from "../../../hooks/useLocale";
import { TankFilters } from "../../../stores/tankFilters";
import { Flex } from "../../Flex";
import { Link } from "../../Link";
import { Text } from "../../Text";

interface NoResultsProps {
  type?: "filters" | "search";
}

export function NoResults({ type = "filters" }: NoResultsProps) {
  const { strings } = useLocale();

  return (
    <Flex align="center" justify="center">
      <Text lowContrast>
        {strings.website.common.tank_search.no_tanks_found.body}{" "}
        <Link
          href="#"
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
