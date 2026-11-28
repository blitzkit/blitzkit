import {
  CharacteristicRanking,
  type CharacteristicRenderConfig,
} from "../types/characteristics";

// Switches come out as "yes" or "no", or as what the game calls them
export const humanBoolean = {
  // Ability values are only comparable to themselves, so nothing is ranked
  ranking: CharacteristicRanking.None,

  render({ output, strings }) {
    return strings.tanks.characteristics.flags[
      output as keyof typeof strings.tanks.characteristics.flags
    ];
  },
} satisfies Partial<CharacteristicRenderConfig>;
