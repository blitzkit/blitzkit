import { useMemo } from "react";
import type { CharacteristicOutput } from "../core/tankopedia/characteristics";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
} from "../core/tankopedia/characteristicsOrder";
import { useGameStrings } from "./useGameStrings";

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
  const tankEntityStrings = useGameStrings(groups);

  function renderCharacteristic(
    characteristic: CharacteristicOutput,
    config: CharacteristicRenderConfig,
  ): string | null {
    if (characteristic === null) return null;

    if (config.render) return config.render(characteristic);

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
      if (config.strings) {
        return tankEntityStrings[characteristic];
      }

      return characteristic;
    }

    return characteristic
      .map((c) => renderCharacteristic(c, config))
      .join(", ");
  }

  return renderCharacteristic;
}
