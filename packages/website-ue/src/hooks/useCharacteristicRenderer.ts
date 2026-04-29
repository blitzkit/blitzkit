import { useMemo, type ReactNode } from "react";
import type { CharacteristicOutput } from "../core/tankopedia/characteristics";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
} from "../core/tankopedia/characteristicsOrder";
import { useGameStrings } from "./useGameStrings";
import { useStrings } from "./useStrings";

export function useCharacteristicRenderer() {
  const groups = useMemo(() => {
    const groups: string[] = [];

    for (const group of characteristicsOrder) {
      for (const item of group.order) {
        if ("strings" in item && item.strings) {
          groups.push(item.strings);
        }
      }
    }

    return groups;
  }, []);

  const strings = useStrings();
  const gameStrings = useGameStrings(groups);

  function renderCharacteristic(
    characteristic: CharacteristicOutput,
    config: CharacteristicRenderConfig,
  ): ReactNode {
    if (characteristic === null) return null;

    if (config.render)
      return config.render({ output: characteristic, strings, gameStrings });

    if (typeof characteristic === "number") {
      if (Number.isFinite(characteristic)) {
        if (config.decimals === undefined) {
          return characteristic.toString();
        }

        return characteristic.toFixed(config.decimals);
      }

      return `${characteristic < 0 ? "-" : ""}∞`;
    }

    if (typeof characteristic === "string") {
      return characteristic;
    }

    return characteristic
      .map((c) => renderCharacteristic(c, config))
      .join(", ");
  }

  return renderCharacteristic;
}
