import {
  alias,
  SEARCH_KEYS,
  TankDefinition,
  TIER_ROMAN_NUMERALS,
} from "@blitzkit/core";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Box, Card, Flex, Spinner, Text, TextField } from "@radix-ui/themes";
import fuzzysort from "fuzzysort";
import { debounce } from "lodash-es";
import { useCallback, useRef, useState } from "react";
import { awaitableTankNames } from "../core/awaitables/tankNames";
import { api } from "../core/blitzkit/api";
import { useLocale } from "../hooks/useLocale";
import { classIcons } from "./ClassIcon";
import { SearchResults } from "./SearchResults";

const { go } = fuzzysort;

const [tankNames, tankDefinitions] = await Promise.all([
  awaitableTankNames,
  api.tankDefinitions(),
]);

const RESULTS_LIMIT = 6;

export type GuessSearch = ReturnType<typeof useGuessSearch>;

export function useGuessSearch(exclude: number[] = []) {
  const { unwrap } = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const excluded = useRef(exclude);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TankDefinition[] | null>(null);
  const [selected, setSelected] = useState<TankDefinition | null>(null);

  excluded.current = exclude;

  const search = useCallback(
    debounce(() => {
      if (!input.current) return;

      setSearching(false);
      const trimmed = input.current.value.trim();

      if (trimmed.length === 0) {
        setResults(null);
        return;
      }

      const searchResults = go(trimmed, tankNames, {
        keys: SEARCH_KEYS,
        limit: RESULTS_LIMIT + excluded.current.length,
      });

      setResults(
        searchResults
          .filter((result) => !excluded.current.includes(result.obj.id))
          .slice(0, RESULTS_LIMIT)
          .map((result) => tankDefinitions.tanks[result.obj.id]),
      );
    }, 500),
    [],
  );

  const requestSearch = useCallback(() => {
    setSelected(null);
    setSearching(true);
    search();
  }, []);

  function select(tank: TankDefinition) {
    if (!input.current) return;

    input.current.value = unwrap(tank.name!);
    setSelected(tank);
    setResults(null);
  }

  function clear() {
    if (!input.current) return;

    input.current.value = "";
    setSelected(null);
    setResults(null);
  }

  return {
    input,
    searching,
    results,
    selected,
    setSelected,
    requestSearch,
    select,
    clear,
  };
}

interface GuessSearchProps {
  search: GuessSearch;
}

export function GuessSearchResults({ search }: GuessSearchProps) {
  const { strings, unwrap } = useLocale();

  if (search.results === null) return null;

  return (
    <Card variant="classic">
      <Box py="2" px="3">
        {search.results.length === 0 && (
          <Flex justify="center">
            <Text color="gray">
              {strings.website.tools.guess.search.no_results}
            </Text>
          </Flex>
        )}

        <SearchResults.Root>
          {search.results.map((result) => {
            const Icon = classIcons[result.class];

            return (
              <SearchResults.Item
                key={result.id}
                onClick={() => search.select(result)}
                text={unwrap(result.name!)}
                prefix={
                  <img
                    style={{ width: "1em", height: "1em" }}
                    src={alias("api", `/flags/circle/${result.nation}.webp`)}
                  />
                }
                discriminator={
                  <Flex align="center" gap="1" width="38px" justify="center">
                    <Icon width="1em" height="1em" />
                    {TIER_ROMAN_NUMERALS[result.tier]}
                  </Flex>
                }
              />
            );
          })}
        </SearchResults.Root>
      </Box>
    </Card>
  );
}

interface GuessSearchFieldProps extends GuessSearchProps {
  disabled?: boolean;
}

export function GuessSearchField({ search, disabled }: GuessSearchFieldProps) {
  const { strings } = useLocale();

  return (
    <TextField.Root
      disabled={disabled}
      ref={search.input}
      onChange={search.requestSearch}
      style={{ flex: 1, maxWidth: "14rem" }}
      placeholder={strings.website.tools.guess.search.placeholder}
      size={{ initial: "2", sm: "3" }}
      variant="classic"
    >
      <TextField.Slot>
        {search.searching ? <Spinner /> : <MagnifyingGlassIcon />}
      </TextField.Slot>
    </TextField.Root>
  );
}
