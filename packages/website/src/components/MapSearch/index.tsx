import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Flex, TextField } from "@radix-ui/themes";
import fuzzysort from "fuzzysort";
import { useMemo, useState, type KeyboardEvent } from "react";
import { api } from "../../core/blitzkit/api";
import { useLocale } from "../../hooks/useLocale";
import { TankCardWrapper } from "../TankSearch/components/TankCardWrapper";
import { MapCard } from "./components/MapCard";
import { RecentlyViewed } from "./components/RecentlyViewed";
import { MAP_CARD_COLUMNS } from "./constants";
import "./index.css";

const mapDefinitions = await api.mapDefinitions();

export function MapSearch() {
  const { strings, unwrap, locale } = useLocale();
  const [search, setSearch] = useState("");
  const maps = useMemo(
    () =>
      Object.values(mapDefinitions.maps)
        .filter((map) => map.model_id === map.id)
        .map((map) => ({ ...map, displayName: unwrap(map.name!) }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [locale],
  );
  const sanitized = search.trim();
  const results =
    sanitized.length === 0
      ? maps
      : fuzzysort
          .go(sanitized, maps, { key: "displayName" })
          .map((result) => result.obj);

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key !== "Enter" || sanitized.length === 0 || !results[0]) return;

    window.location.href = `/maps/${results[0].slug}`;
  }

  return (
    <Flex direction="column" gap="4">
      <TextField.Root
        variant="classic"
        placeholder={strings.website.tools.maps.search}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={handleKeyDown}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon />
        </TextField.Slot>
      </TextField.Root>

      {sanitized.length === 0 && <RecentlyViewed />}

      <TankCardWrapper columns={MAP_CARD_COLUMNS}>
        {results.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </TankCardWrapper>
    </Flex>
  );
}
