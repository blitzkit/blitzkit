import { Flex, Separator, Text } from "@radix-ui/themes";
import { api } from "../../../core/blitzkit/api";
import { useLocale } from "../../../hooks/useLocale";
import { MapsPersistent } from "../../../stores/mapsPersistent";
import { TankCardWrapper } from "../../TankSearch/components/TankCardWrapper";
import { MAP_CARD_COLUMNS } from "../constants";
import { MapCard } from "./MapCard";

const mapDefinitions = await api.mapDefinitions();

export function RecentlyViewed() {
  const { strings } = useLocale();
  // non-reactive because it is a little weird that it updates instantly even before the page loads
  const recentlyViewed = MapsPersistent.state.recentlyViewed.filter(
    (id) => id in mapDefinitions.maps,
  );

  if (recentlyViewed.length === 0) return null;

  return (
    <Flex direction="column" gap="2" mt="2" mb="6">
      <Text color="gray" align="center">
        {strings.website.tools.maps.recent}
      </Text>
      <TankCardWrapper columns={MAP_CARD_COLUMNS}>
        {recentlyViewed.map((id) => (
          <MapCard map={mapDefinitions.maps[id]} key={id} />
        ))}
      </TankCardWrapper>

      <Separator size="4" />
    </Flex>
  );
}
