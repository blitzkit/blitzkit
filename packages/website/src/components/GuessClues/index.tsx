import { literals } from "@blitzkit/i18n";
import { ArrowRightIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { times } from "lodash-es";
import type { CSSProperties } from "react";
import {
  clueKeys,
  MAX_GUESSES,
  randomTank,
} from "../../core/blitzkit/guessClues";
import { useLocale } from "../../hooks/useLocale";
import { GuessState } from "../../stores/guess";
import { GuessClues } from "../../stores/guessClues";
import {
  GuessSearchField,
  GuessSearchResults,
  useGuessSearch,
} from "../GuessSearch";
import { ClueRow } from "./ClueRow";
import "./index.css";

export function CluesGuesser() {
  const tank = GuessClues.use((state) => state.tank);
  const guesses = GuessClues.use((state) => state.guesses);
  const guessState = GuessClues.use((state) => state.guessState);
  const correctGuesses = GuessClues.use((state) => state.correctGuesses);
  const totalGuesses = GuessClues.use((state) => state.totalGuesses);
  const streak = GuessClues.use((state) => state.streak);
  const { strings, unwrap } = useLocale();
  const search = useGuessSearch(guesses.map((guess) => guess.id));
  const isNotGuessed = guessState === GuessState.NotGuessed;

  function nextRound() {
    GuessClues.mutate((draft) => {
      draft.tank = randomTank();
      draft.guesses = [];
      draft.guessState = GuessState.NotGuessed;
    });

    search.clear();
  }

  return (
    <Flex
      direction="column"
      gap="4"
      flexGrow="1"
      style={{ "--clue-count": clueKeys.length + 1 } as CSSProperties}
    >
      <Box overflowX="auto">
        <Grid
          columns={`minmax(9rem, 1.5fr) repeat(${clueKeys.length}, minmax(5.5rem, 1fr))`}
          gap="1"
          minWidth="56rem"
          style={{ perspective: "40rem" }}
        >
          <Text size="1" color="gray" align="center">
            {strings.website.tools.guess.clues.columns.tank}
          </Text>
          {clueKeys.map((key) => (
            <Text key={key} size="1" color="gray" align="center">
              {strings.website.tools.guess.clues.columns[key]}
            </Text>
          ))}

          {times(MAX_GUESSES, (index) => (
            <ClueRow key={index} guess={guesses[index]} target={tank} />
          ))}
        </Grid>
      </Box>

      <Flex direction="column" align="center" gap="1">
        {guessState === GuessState.Correct && (
          <Text
            as="div"
            className="clues-result"
            size="6"
            weight="bold"
            color="green"
          >
            {literals(
              strings.website.tools.guess.clues[
                guesses.length === 1 ? "correct_single" : "correct"
              ],
              { count: guesses.length },
            )}
          </Text>
        )}

        {guessState === GuessState.Incorrect && (
          <Text as="div" className="clues-result" size="4" weight="bold">
            {literals(strings.website.tools.guess.clues.answer, {
              tank: unwrap(tank.name!),
            })}
          </Text>
        )}

        <Text color="gray">
          {literals(strings.website.tools.guess.clues.guesses, {
            count: guesses.length,
            max: MAX_GUESSES,
          })}
        </Text>

        <Text>
          {literals(strings.website.tools.guess.stats, {
            correct: correctGuesses,
            total: totalGuesses,
            streak: streak,
          })}
        </Text>
      </Flex>

      <Flex direction="column" gap="3" width="100%" maxWidth="25rem" mx="auto">
        <Flex gap={{ initial: "2", sm: "3" }} justify="center">
          <GuessSearchField search={search} disabled={!isNotGuessed} />

          <Button
            size={{ initial: "2", sm: "3" }}
            disabled={isNotGuessed && search.selected === null}
            onClick={() => {
              if (!isNotGuessed) {
                nextRound();
                return;
              }

              const guess = search.selected;

              if (!guess) return;

              const correct = guess.id === tank.id;
              const isLastGuess = guesses.length + 1 >= MAX_GUESSES;

              GuessClues.mutate((draft) => {
                draft.guesses.push(guess);

                if (!correct && !isLastGuess) return;

                draft.guessState = correct
                  ? GuessState.Correct
                  : GuessState.Incorrect;
                draft.totalGuesses++;
                draft.correctGuesses += correct ? 1 : 0;
                draft.streak = correct ? draft.streak + 1 : 0;
              });

              search.clear();
            }}
          >
            {isNotGuessed ? (
              <>
                {strings.website.tools.guess.search.guess}
                <PaperPlaneIcon />
              </>
            ) : (
              <>
                {strings.website.tools.guess.search.next}
                <ArrowRightIcon />
              </>
            )}
          </Button>
        </Flex>

        <Box position="relative">
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            style={{ zIndex: 1 }}
          >
            <GuessSearchResults search={search} />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
}
