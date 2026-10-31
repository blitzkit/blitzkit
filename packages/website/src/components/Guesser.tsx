import { alias, romanize, SEARCH_KEYS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { TankDefinition } from "@blitzkit/protos";
import {
  ArrowRightIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  MixerVerticalIcon,
  PaperPlaneIcon,
  StarFilledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import fuzzysort from "fuzzysort";
import { debounce } from "lodash-es";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/dynamic";
import { awaitableTankNames } from "../core/awaitables/tankNames";
import { awaitableTiers } from "../core/awaitables/tiers";
import { useStrings } from "../hooks/useStrings";
import { useUnwrapper } from "../hooks/useUnwrapper";
import { Guess, GuessState } from "../stores/guess";
import { AlertDialog } from "./AlertDialog";
import { Button } from "./Button";
import { ClassIcon } from "./ClassIcon";
import { DropdownMenu } from "./DropdownMenu";
import { IconButton } from "./IconButton";
import { SearchResults } from "./SearchResults";
import { Spinner } from "./Spinner";
import { Text } from "./Text";
import { TextField } from "./TextField";

const { go } = fuzzysort;

const [tankNames, tankDefinitions, TIERS] = await Promise.all([
  awaitableTankNames,
  api.tanks(),
  awaitableTiers,
]);

const ids = Object.keys(tankDefinitions.tanks);

export function Guesser() {
  const strings = useStrings();
  const unwrap = useUnwrapper();

  const tank = Guess.use((state) => state.tank);
  const guessState = Guess.use((state) => state.guessState);
  const correctGuesses = Guess.use((state) => state.correctGuesses);
  const totalGuesses = Guess.use((state) => state.totalGuesses);
  const helpingReveal = Guess.use((state) => state.helpingReveal);
  const streak = Guess.use((state) => state.streak);
  const input = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<TankDefinition[] | null>(null);
  const [selected, setSelected] = useState<TankDefinition | null>(null);
  const tiers = Guess.use((state) => state.tiers);
  const status = useRef<HTMLSpanElement>(null);

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
        searchResults.map((result) => tankDefinitions.tanks[result.obj.id]),
      );
    }, 500),
    [],
  );

  useEffect(() => {
    if (guessState !== GuessState.NotGuessed) setSelected(null);
  }, [guessState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!status.current) return;

      status.current.innerText = literals(strings.guesser.stats, {
        correct: correctGuesses,
        total: totalGuesses,
        streak: streak,
      });
    }, 1000 / 200);

    return () => clearInterval(interval);
  }, [correctGuesses, totalGuesses, streak]);

  return (
    <div
      direction="column"
      position="absolute"
      bottom="0"
      left="50%"
      style={{ transform: "translateX(-50%)" }}
      width="100%"
      p="4"
      maxWidth="25rem"
      gap="3"
    >
      <div position="relative">
        {results !== null && (
          <Card variant="classic">
            <div py="2" px="3">
              {results.length === 0 && (
                <div justify="center">
                  <Text color="gray">{strings.common.search.no_results}</Text>
                </div>
              )}

              <SearchResults.Root>
                {results.map((result) => {
                  return (
                    <SearchResults.Item
                      key={result.id}
                      onClick={() => {
                        if (!input.current) return;

                        input.current.value = unwrap(result.name!);
                        setSelected(result);
                        setResults(null);
                      }}
                      text={unwrap(result.name!)}
                      prefix={
                        <img
                          style={{ width: "1em", height: "1em" }}
                          src={alias(
                            "api",
                            `/flags/circle/${result.nation}.webp`,
                          )}
                        />
                      }
                      discriminator={
                        <div
                          align="center"
                          gap="1"
                          width="38px"
                          justify="center"
                        >
                          <ClassIcon
                            class={result.class}
                            width="1em"
                            height="1em"
                          />
                          {romanize(result.tier)}
                        </div>
                      }
                    />
                  );
                })}
              </SearchResults.Root>
            </div>
          </Card>
        )}
      </div>

      <div justify="center" style={{ userSelect: "none" }}>
        <Text ref={status} />
      </div>

      <div gap={{ initial: "2", sm: "3" }}>
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger>
            <IconButton
              size={{ initial: "2", sm: "3" }}
              variant="surface"
              color="gray"
            >
              <MixerVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            {TIERS.map((tier) => {
              const isSelected = tiers.includes(tier);

              return (
                <DropdownMenu.CheckboxItem
                  checked={isSelected}
                  key={tier}
                  onClick={(event) => {
                    event.preventDefault();

                    Guess.mutate((draft) => {
                      if (isSelected) {
                        if (draft.tiers.length === 1) return;
                        draft.tiers = draft.tiers.filter((t) => t !== tier);
                      } else {
                        draft.tiers = [...draft.tiers, tier];
                      }

                      draft.streak = 0;
                    });
                  }}
                >
                  {literals(strings.guesser.tier, {
                    tier: romanize(tier),
                  })}
                </DropdownMenu.CheckboxItem>
              );
            })}

            <DropdownMenu.Separator />

            <DropdownMenu.Item
              onClick={(event) => {
                event.preventDefault();

                Guess.mutate((draft) => {
                  draft.tiers = Guess.initial.tiers;
                });
              }}
            >
              <StarFilledIcon /> {strings.guesser.select_all}
            </DropdownMenu.Item>

            <DropdownMenu.Item
              color="red"
              onClick={(event) => {
                event.preventDefault();

                Guess.mutate((draft) => {
                  draft.tiers = [];
                });
              }}
            >
              <TrashIcon /> {strings.guesser.clear}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <TextField
          disabled={guessState !== GuessState.NotGuessed}
          ref={input}
          onChange={requestSearch}
          style={{ flex: 1, maxWidth: "14rem" }}
          placeholder={strings.common.search.hint_tanks}
          size={{ initial: "2", sm: "3" }}
          variant="classic"
        >
          {searching ? <Spinner /> : <MagnifyingGlassIcon />}
        </TextField>

        <AlertDialog.Root>
          <AlertDialog.Trigger>
            <IconButton
              size={{ initial: "2", sm: "3" }}
              disabled={guessState !== GuessState.NotGuessed}
            >
              <EyeOpenIcon />
            </IconButton>
          </AlertDialog.Trigger>

          <AlertDialog.Content>
            <AlertDialog.Title>{strings.guesser.help.title}</AlertDialog.Title>
            <AlertDialog.Description>
              {strings.guesser.help.description}
            </AlertDialog.Description>

            <div justify="end" gap="2">
              <AlertDialog.Cancel>
                <Button variant="outline">{strings.guesser.help.cancel}</Button>
              </AlertDialog.Cancel>

              <AlertDialog.Action>
                <Button
                  color="tomato"
                  onClick={() => {
                    Guess.mutate((draft) => {
                      draft.helpingReveal = true;
                      draft.streak = 0;
                    });
                  }}
                >
                  {strings.guesser.help.reveal}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Root>

        <Button
          size={{ initial: "2", sm: "3" }}
          color={
            guessState === GuessState.NotGuessed && selected === null
              ? "red"
              : undefined
          }
          onClick={() => {
            if (guessState === GuessState.NotGuessed) {
              const correct =
                selected !== null && selected.id === tank && !helpingReveal;

              Guess.mutate((draft) => {
                draft.guessState = correct
                  ? GuessState.Correct
                  : GuessState.Incorrect;
                draft.totalGuesses++;
                draft.correctGuesses +=
                  correct && draft.tiers.length === 10 ? 1 : 0;
                draft.streak = correct ? draft.streak + 1 : 0;
              });
            } else {
              const filteredIds = ids.filter((id) => {
                const tank = tankDefinitions.tanks[Number(id)];
                return tiers.includes(tank.tier);
              });
              const id = Number(
                filteredIds[Math.floor(Math.random() * filteredIds.length)],
              );
              const tank = tankDefinitions.tanks[id];

              Guess.mutate((draft) => {
                if (!input.current) return;

                draft.tank = tank.id;
                draft.guessState = GuessState.NotGuessed;
                draft.helpingReveal = false;

                input.current.value = "";
              });
            }
          }}
        >
          {guessState === GuessState.NotGuessed ? (
            <>
              {strings.guesser.search[selected === null ? "skip" : "guess"]}
              {selected === null ? <ArrowRightIcon /> : <PaperPlaneIcon />}
            </>
          ) : (
            <>
              {strings.guesser.search.next}
              <ArrowRightIcon />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
