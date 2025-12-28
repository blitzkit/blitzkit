import {
  asset,
  SEARCH_KEYS,
  TankDefinition,
  TIER_ROMAN_NUMERALS,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  PaperPlaneIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import fuzzysort from "fuzzysort";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";
import { awaitableTankDefinitions } from "../core/awaitables/tankDefinitions";
import { awaitableTankNames } from "../core/awaitables/tankNames";
import { useLocale } from "../hooks/useLocale";
import { Guess, GuessState } from "../stores/guess";
import { classIcons } from "./ClassIcon";
import { SearchResults } from "./SearchResults";

const { go } = fuzzysort;

const [tankNames, tankDefinitions] = await Promise.all([
  awaitableTankNames,
  awaitableTankDefinitions,
]);

const ids = Object.keys(tankDefinitions.tanks);

export function Guesser() {
  const tank = Guess.use((state) => state.tank);
  const guessState = Guess.use((state) => state.guessState);
  const correctGuesses = Guess.use((state) => state.correctGuesses);
  const totalGuesses = Guess.use((state) => state.totalGuesses);
  const streak = Guess.use((state) => state.streak);
  const { strings, unwrap } = useLocale();
  const input = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TankDefinition[] | null>(null);
  const [selected, setSelected] = useState<TankDefinition | null>(null);

  const requestSearch = useCallback(() => {
    setSelected(null);
    setSearching(true);
    search();
  }, []);
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
        limit: 6,
      });

      setResults(
        searchResults.map((result) => tankDefinitions.tanks[result.obj.id])
      );
    }, 500),
    []
  );

  useEffect(() => {
    if (guessState !== GuessState.NotGuessed) setSelected(null);
  }, [guessState]);

  return (
    <Flex
      direction="column"
      position="absolute"
      bottom="0"
      left="50%"
      style={{ transform: "translateX(-50%)" }}
      width="100%"
      p="4"
      maxWidth="25rem"
      gap="4"
    >
      {results !== null && (
        <Card variant="classic">
          <Box py="2" px="3">
            {results.length === 0 && (
              <Flex justify="center">
                <Text color="gray">
                  {strings.website.tools.guess.search.no_results}
                </Text>
              </Flex>
            )}

            <SearchResults.Root>
              {results.map((result) => {
                const Icon = classIcons[result.class];

                return (
                  <SearchResults.Item
                    key={result.id}
                    onClick={() => {
                      if (!input.current) return;

                      input.current.value = unwrap(result.name);
                      setSelected(result);
                      setResults(null);
                    }}
                    text={unwrap(result.name)}
                    prefix={
                      <img
                        style={{ width: "1em", height: "1em" }}
                        src={asset(`flags/circle/${result.nation}.webp`)}
                      />
                    }
                    discriminator={
                      <Flex
                        align="center"
                        gap="1"
                        width="38px"
                        justify="center"
                      >
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
      )}

      <Flex justify="center" style={{ userSelect: "none" }}>
        <Text>
          {literals(strings.website.tools.guess.stats, {
            correct: correctGuesses,
            total: totalGuesses,
            streak: streak,
          })}
        </Text>
      </Flex>

      <Flex gap="3">
        <TextField.Root
          disabled={guessState !== GuessState.NotGuessed}
          ref={input}
          onChange={requestSearch}
          style={{ flex: 1 }}
          placeholder={strings.website.tools.guess.search.placeholder}
          size="3"
          variant="classic"
        >
          <TextField.Slot>
            {searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>
        </TextField.Root>

        <Button
          size="3"
          color={
            guessState === GuessState.NotGuessed && selected === null
              ? "red"
              : undefined
          }
          onClick={() => {
            if (guessState === GuessState.NotGuessed) {
              const correct = selected !== null && selected.id === tank.id;

              Guess.mutate((draft) => {
                draft.guessState = correct
                  ? GuessState.Correct
                  : GuessState.Incorrect;
                draft.totalGuesses++;
                draft.correctGuesses += correct ? 1 : 0;
                draft.streak = correct ? draft.streak + 1 : 0;
              });
            } else {
              const id = Number(ids[Math.floor(Math.random() * ids.length)]);
              const tank = tankDefinitions.tanks[id];

              Guess.mutate((draft) => {
                if (!input.current) return;

                draft.tank = tank;
                draft.guessState = GuessState.NotGuessed;

                input.current.value = "";
              });
            }
          }}
        >
          {guessState === GuessState.NotGuessed ? (
            <>
              {
                strings.website.tools.guess.search[
                  selected === null ? "skip" : "guess"
                ]
              }
              {selected === null ? <ArrowRightIcon /> : <PaperPlaneIcon />}
            </>
          ) : (
            <>
              {strings.website.tools.guess.search.next}
              <ArrowRightIcon />
            </>
          )}
        </Button>
      </Flex>
    </Flex>
  );
}
