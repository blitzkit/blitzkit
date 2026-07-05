import { literalsArray } from "@blitzkit/i18n";
import { useMemo, type ReactNode } from "react";
import { Text } from "../components/Text";
import type { CharacteristicOutput } from "../config/characteristics";
import {
  characteristicsOrder,
  type CharacteristicRenderConfig,
} from "../config/characteristicsOrder";
import { useGameStrings } from "./useGameStrings";
import { useLocale } from "./useLocale";
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

  const locale = useLocale();
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
        let value: ReactNode = characteristic;

        if (config.decimals !== undefined) {
          value *= 10 ** config.decimals;
          value = Math.round(value);
          value /= 10 ** config.decimals;
        }

        if (config.localize) {
          value = value.toLocaleString(locale);
        } else {
          value = value.toFixed(config.decimals);
        }

        if (config.units !== undefined) {
          value = literalsArray(strings.units[config.units], {
            value: <Text>{value}</Text>,
          });
        }

        return value;
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
