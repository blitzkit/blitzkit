import { alias, TankDefinition, TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { ArrowDownIcon, ArrowUpIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import type { CSSProperties, ReactNode } from "react";
import {
  type ClueKey,
  clueKeys,
  ClueResult,
  compareClue,
  type TankClues,
  tankClues,
} from "../../core/blitzkit/guessClues";
import { useLocale } from "../../hooks/useLocale";
import { classIcons } from "../ClassIcon";

const resultColors: Record<ClueResult, string> = {
  [ClueResult.Correct]: "green",
  [ClueResult.Incorrect]: "red",
  [ClueResult.Higher]: "amber",
  [ClueResult.Lower]: "amber",
};

interface ClueCellProps {
  color?: string;
  index?: number;
  correct?: boolean;
  children?: ReactNode;
}

function ClueCell({ color = "gray", index, correct, children }: ClueCellProps) {
  return (
    <Flex
      align="center"
      justify="center"
      gap="1"
      height="3rem"
      px="2"
      className={
        index === undefined
          ? undefined
          : `clue-cell${correct ? " clue-cell-correct" : ""}`
      }
      style={
        {
          "--clue-index": index,
          borderRadius: "var(--radius-2)",
          backgroundColor: `var(--${color}-a${children ? 5 : 2})`,
          textAlign: "center",
        } as CSSProperties
      }
    >
      {children}
    </Flex>
  );
}

interface ClueRowProps {
  guess?: TankDefinition;
  target: TankDefinition;
}

export function ClueRow({ guess, target }: ClueRowProps) {
  const { strings, unwrap } = useLocale();

  if (!guess) {
    return (
      <>
        <ClueCell key="tank" />
        {clueKeys.map((key) => (
          <ClueCell key={key} />
        ))}
      </>
    );
  }

  const guessClues = tankClues(guess);
  const targetClues = tankClues(target);
  const correct = guess.id === target.id;

  function format(key: ClueKey, clues: TankClues) {
    switch (key) {
      case "tier":
        return TIER_ROMAN_NUMERALS[clues.tier];
      case "class": {
        const Icon = classIcons[clues.class];

        return (
          <>
            <Icon width="1em" height="1em" />
            {strings.common.tank_class_short[clues.class]}
          </>
        );
      }
      case "nation":
        return (
          <img
            style={{ width: "1.5em", height: "1.5em" }}
            title={
              strings.common.nations[
                clues.nation as keyof typeof strings.common.nations
              ]
            }
            src={alias("api", `/flags/circle/${clues.nation}.webp`)}
          />
        );
      case "type":
        return strings.common.tree_type[clues.type];
      case "gun_type":
        return strings.common.gun_types[clues.gun_type];
      case "health":
        return literals(strings.common.units.hp, { value: clues.health });
      case "damage":
        return clues.damage;
      case "reload":
        return literals(strings.website.tools.guess.clues.seconds, {
          value: clues.reload.toFixed(1),
        });
    }
  }

  return (
    <>
      <ClueCell
        key={`${guess.id}-tank`}
        color="gray"
        index={0}
        correct={correct}
      >
        <Text size="2" weight="medium" truncate>
          {unwrap(guess.name!)}
        </Text>
      </ClueCell>

      {clueKeys.map((key, index) => {
        const result = compareClue(key, guessClues, targetClues);

        return (
          <ClueCell
            key={`${guess.id}-${key}`}
            color={resultColors[result]}
            index={index + 1}
            correct={correct}
          >
            <Text size="2">{format(key, guessClues)}</Text>
            {result === ClueResult.Higher && <ArrowUpIcon />}
            {result === ClueResult.Lower && <ArrowDownIcon />}
          </ClueCell>
        );
      })}
    </>
  );
}
