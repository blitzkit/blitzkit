import { literalsArray } from "@blitzkit/i18n/src/literals";
import { useMemo, type ReactNode } from "react";
import { Text } from "../components/Text";
import { characteristicsGroups } from "../config/characteristicsGroups";
import type {
  CharacteristicRenderConfig,
  CharacteristicReturnType,
} from "../types/characteristics";
import { useLocale } from "./useLocale";
import { useStrings } from "./useStrings";

export function useCharacteristicRenderer() {
  const groups = useMemo(() => {
    const groups: string[] = [];

    for (const group of characteristicsGroups) {
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

  function renderCharacteristic(
    characteristic: CharacteristicReturnType,
    config: CharacteristicRenderConfig,
  ): ReactNode {
    if (characteristic === null) return null;

    if (config.render)
      return config.render({ output: characteristic, strings });

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

    throw new Error("Unknown characteristic type");
  }

  return renderCharacteristic;
}
