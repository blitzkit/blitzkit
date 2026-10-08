import { TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import {
  ArrowRightIcon,
  EyeOpenIcon,
  MixerVerticalIcon,
  PaperPlaneIcon,
  StarFilledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  AlertDialog,
  Box,
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  Text,
} from "@radix-ui/themes";
import { useEffect, useRef } from "react";
import { awaitableTiers } from "../core/awaitables/tiers";
import { api } from "../core/blitzkit/api";
import { useLocale } from "../hooks/useLocale";
import { Guess, GuessState } from "../stores/guess";
import {
  GuessSearchField,
  GuessSearchResults,
  useGuessSearch,
} from "./GuessSearch";

const [tankDefinitions, TIERS] = await Promise.all([
  api.tankDefinitions(),
  awaitableTiers,
]);

const ids = Object.keys(tankDefinitions.tanks);

export function Guesser() {
  const tank = Guess.use((state) => state.tank);
  const guessState = Guess.use((state) => state.guessState);
  const correctGuesses = Guess.use((state) => state.correctGuesses);
  const totalGuesses = Guess.use((state) => state.totalGuesses);
  const helpingReveal = Guess.use((state) => state.helpingReveal);
  const streak = Guess.use((state) => state.streak);
  const { strings } = useLocale();
  const search = useGuessSearch();
  const tiers = Guess.use((state) => state.tiers);
  const status = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (guessState !== GuessState.NotGuessed) search.setSelected(null);
  }, [guessState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!status.current) return;

      status.current.innerText = literals(strings.website.tools.guess.stats, {
        correct: correctGuesses,
        total: totalGuesses,
        streak: streak,
      });
    }, 1000 / 200);

    return () => clearInterval(interval);
  }, [correctGuesses, totalGuesses, streak]);

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
      gap="3"
    >
      <Box position="relative">
        <GuessSearchResults search={search} />
      </Box>

      <Flex justify="center" style={{ userSelect: "none" }}>
        <Text ref={status} />
      </Flex>

      <Flex gap={{ initial: "2", sm: "3" }}>
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
                  {literals(strings.website.tools.guess.tier, {
                    tier: TIER_ROMAN_NUMERALS[tier],
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
              <StarFilledIcon /> {strings.website.tools.guess.select_all}
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
              <TrashIcon /> {strings.website.tools.guess.clear}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <GuessSearchField
          search={search}
          disabled={guessState !== GuessState.NotGuessed}
        />

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
            <AlertDialog.Title>
              {strings.website.tools.guess.help.title}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {strings.website.tools.guess.help.description}
            </AlertDialog.Description>

            <Flex justify="end" gap="2">
              <AlertDialog.Cancel>
                <Button variant="outline">
                  {strings.website.tools.guess.help.cancel}
                </Button>
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
                  {strings.website.tools.guess.help.reveal}
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>

        <Button
          size={{ initial: "2", sm: "3" }}
          color={
            guessState === GuessState.NotGuessed && search.selected === null
              ? "red"
              : undefined
          }
          onClick={() => {
            if (guessState === GuessState.NotGuessed) {
              const correct =
                search.selected !== null &&
                search.selected.id === tank.id &&
                !helpingReveal;

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
                draft.tank = tank;
                draft.guessState = GuessState.NotGuessed;
                draft.helpingReveal = false;
              });

              search.clear();
            }
          }}
        >
          {guessState === GuessState.NotGuessed ? (
            <>
              {
                strings.website.tools.guess.search[
                  search.selected === null ? "skip" : "guess"
                ]
              }
              {search.selected === null ? (
                <ArrowRightIcon />
              ) : (
                <PaperPlaneIcon />
              )}
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
