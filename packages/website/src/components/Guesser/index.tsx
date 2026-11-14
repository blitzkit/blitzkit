import { alias, romanize, SEARCH_KEYS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { TankDefinition } from "@blitzkit/protos";
import {
  ArrowRightIcon,
  CheckIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  MixerVerticalIcon,
  PaperPlaneIcon,
  StarFilledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import fuzzysort from "fuzzysort";
import type { QuicklimeEvent } from "quicklime";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/dynamic";
import { awaitableTankNames } from "../../core/awaitables/tankNames";
import { awaitableTiers } from "../../core/awaitables/tiers";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Guess, GuessState } from "../../stores/guess";
import { AlertDialog } from "../AlertDialog";
import { Button } from "../Button";
import { Card } from "../Card";
import { ClassIcon } from "../ClassIcon";
import { DropdownMenu } from "../DropdownMenu";
import { IconButton } from "../IconButton";
import { TRANSITION_ANIMATION_TIME, transitionEvent } from "../Lighting";
import { Text } from "../Text";
import { TextField } from "../TextField";
import styles from "./index.module.css";

const { go } = fuzzysort;

const [tankNames, tankDefinitions, TIERS] = await Promise.all([
  awaitableTankNames,
  api.tanks(),
  awaitableTiers,
]);

// resolves once the lights have fully receded
function waitForDarkness() {
  return new Promise<void>((resolve) => {
    function done() {
      clearTimeout(fallback);
      transitionEvent.off(handleTransition);
      resolve();
    }

    function handleTransition(event: QuicklimeEvent<number>) {
      if (event.data === 0) done();
    }

    // in case the renderer isn't animating (e.g. hidden tab)
    const fallback = setTimeout(done, (TRANSITION_ANIMATION_TIME + 0.5) * 1000);

    transitionEvent.on(handleTransition);
  });
}

const ids = Object.keys(tankDefinitions.tanks);

export function Guesser() {
  const strings = useStrings();
  const unwrap = useUnwrapper();

  const tank = Guess.use((state) => state.tank);
  const guessState = Guess.use((state) => state.guessState);
  const correctGuesses = Guess.use((state) => state.correctGuesses);
  const totalGuesses = Guess.use((state) => state.totalGuesses);
  const helpingReveal = Guess.use((state) => state.helpingReveal);
  const advancing = Guess.use((state) => state.advancing);
  const streak = Guess.use((state) => state.streak);
  const input = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<TankDefinition[] | null>(null);
  const [selected, setSelected] = useState<TankDefinition | null>(null);
  const tiers = Guess.use((state) => state.tiers);
  const allTiersSelected = tiers.length === TIERS.length;

  const requestSearch = useCallback(() => {
    if (!input.current) return;

    setSelected(null);

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
  }, []);

  useEffect(() => {
    if (guessState !== GuessState.NotGuessed) setSelected(null);
  }, [guessState]);

  return (
    <div className={styles.guesser}>
      <div className={styles.results}>
        {results !== null && (
          <Card>
            {results.length === 0 && (
              <div className={styles.empty}>
                <Text color="gray">{strings.common.search.no_results}</Text>
              </div>
            )}

            <div className={styles.list}>
              {results.map((result) => {
                return (
                  <button
                    key={result.id}
                    className={styles.item}
                    onClick={() => {
                      if (!input.current) return;

                      input.current.value = unwrap(result.name!);
                      setSelected(result);
                      setResults(null);
                    }}
                  >
                    <img
                      className={styles.flag}
                      src={alias("api", `/flags/circle/${result.nation}.webp`)}
                    />
                    <Text className={styles.name}>{unwrap(result.name!)}</Text>
                    <span className={styles.discriminator}>
                      <ClassIcon
                        class={result.class}
                        width="1em"
                        height="1em"
                      />
                      {romanize(result.tier)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <Text lowContrast>
        {allTiersSelected
          ? literals(strings.guesser.stats, {
              correct: correctGuesses,
              total: totalGuesses,
              streak,
            })
          : strings.guesser.stats_untracked}
      </Text>

      <div className={styles.controls}>
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <IconButton variant="surface" color="gray">
              <MixerVerticalIcon />
            </IconButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="start">
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
                    });
                  }}
                >
                  <DropdownMenu.ItemIndicator>
                    <CheckIcon />
                  </DropdownMenu.ItemIndicator>

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
              {strings.guesser.select_all}
              <StarFilledIcon />
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={(event) => {
                event.preventDefault();

                Guess.mutate((draft) => {
                  // at least one tier must stay selected
                  draft.tiers = [Math.max(...TIERS)];
                });
              }}
            >
              {strings.guesser.clear}
              <TrashIcon />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <IconButton
              color="gray"
              variant="surface"
              disabled={guessState !== GuessState.NotGuessed}
            >
              <EyeOpenIcon />
            </IconButton>
          </AlertDialog.Trigger>

          <AlertDialog.Portal>
            <AlertDialog.Overlay />
            <AlertDialog.Content>
              <AlertDialog.Title>
                {strings.guesser.help.title}
              </AlertDialog.Title>
              <AlertDialog.Description>
                {strings.guesser.help.description}
              </AlertDialog.Description>

              <AlertDialog.Actions>
                <AlertDialog.Cancel asChild>
                  <Button variant="outline" color="gray">
                    {strings.guesser.help.cancel}
                  </Button>
                </AlertDialog.Cancel>

                <AlertDialog.Action asChild>
                  <Button
                    color="red"
                    onClick={() => {
                      Guess.mutate((draft) => {
                        draft.helpingReveal = true;
                      });
                    }}
                  >
                    {strings.guesser.help.reveal}
                  </Button>
                </AlertDialog.Action>
              </AlertDialog.Actions>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <TextField
          disabled={guessState !== GuessState.NotGuessed}
          ref={input}
          onChange={requestSearch}
          className={styles.field}
          placeholder={strings.common.search.hint_tanks}
        >
          <MagnifyingGlassIcon />
        </TextField>

        <Button
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
                  correct && draft.tiers.length === TIERS.length ? 1 : 0;
                draft.streak = correct ? draft.streak + 1 : 0;
              });
            } else {
              if (advancing) return;

              const filteredIds = ids.filter((id) => {
                const tank = tankDefinitions.tanks[Number(id)];
                return tiers.includes(tank.tier);
              });
              const id = Number(
                filteredIds[Math.floor(Math.random() * filteredIds.length)],
              );
              const tank = tankDefinitions.tanks[id];

              Guess.mutate((draft) => {
                draft.advancing = true;
              });

              waitForDarkness().then(() => {
                Guess.mutate((draft) => {
                  draft.tank = tank.id;
                  draft.guessState = GuessState.NotGuessed;
                  draft.helpingReveal = false;
                  draft.advancing = false;
                });

                if (input.current) input.current.value = "";
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
