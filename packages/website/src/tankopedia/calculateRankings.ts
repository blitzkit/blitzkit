import { characteristics as characteristicDefinitions } from "../config/characteristics";
import { characteristicsGroups } from "../config/characteristicsGroups";
import {
  CharacteristicRanking as CharacteristicRankingDirection,
  CharacteristicType,
  type CharacteristicName,
  type CharacteristicRenderConfig,
  type CharacteristicReturnType,
  type ComputedCharacteristics,
} from "../types/characteristics";

const characteristicConfigs = new Map<
  CharacteristicName,
  CharacteristicRenderConfig
>();

for (const { order } of characteristicsGroups) {
  for (const item of order) {
    if (!("name" in item)) continue;
    characteristicConfigs.set(item.name, item);
  }
}

export interface CharacteristicRank {
  rank: number;
  total: number;
  score: number;
}

function rankingValue(
  name: CharacteristicName,
  value?: CharacteristicReturnType,
) {
  if (value === undefined) return;

  switch (characteristicDefinitions[name].type) {
    case CharacteristicType.Enum:
      return;

    case CharacteristicType.Number:
      return value as number;

    case CharacteristicType.NumberList: {
      const values = value as number[];

      if (values.length === 0) return;

      let total = 0;

      for (const current of values) {
        total += current;
      }

      return total / values.length;
    }
  }
}

export function calculateRankings(
  characteristics: ComputedCharacteristics,
  comparisons: ComputedCharacteristics[],
) {
  const rankings = new Map<CharacteristicName, CharacteristicRank>();

  for (const [name, value] of characteristics) {
    const currentValue = rankingValue(name, value);

    if (currentValue === undefined || name[0] === "_") continue;

    const config = characteristicConfigs.get(name)!;

    if (config.ranking === CharacteristicRankingDirection.None) continue;

    const lowerIsBetter =
      config.ranking === CharacteristicRankingDirection.LowerIsBetter;

    const values = comparisons
      .map((comparison) => rankingValue(name, comparison.get(name)))
      .filter((other) => other !== undefined);

    if (values.length === 0) continue;

    const betterCount = values.filter((other) =>
      lowerIsBetter ? other < currentValue : other > currentValue,
    ).length;

    rankings.set(name, {
      rank: Math.min(betterCount + 1, values.length),
      total: values.length,
      score: (values.length - betterCount) / values.length,
    });
  }

  return rankings;
}
