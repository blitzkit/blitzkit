import { literalsArray } from "@blitzkit/i18n/src/literals";
import { Fragment, type ReactNode } from "react";
import { Text } from "../components/Text";
import { characteristics } from "../config/characteristics";
import type {
  CharacteristicRenderConfig,
  CharacteristicReturnType,
} from "../types/characteristics";
import { CharacteristicType } from "../types/characteristics";
import { useLocale } from "./useLocale";
import { useStrings } from "./useStrings";

export function useCharacteristicRenderer() {
  const locale = useLocale();
  const strings = useStrings();

  function renderCharacteristic(
    characteristic: CharacteristicReturnType,
    config: CharacteristicRenderConfig,
  ): ReactNode {
    if (characteristic === null) return null;

    if (config.render)
      return config.render({ output: characteristic, strings });

    function renderNumber(
      value: number,
      units: CharacteristicRenderConfig["units"],
    ): ReactNode {
      if (!Number.isFinite(value)) return `${value < 0 ? "-" : ""}∞`;

      let rendered: ReactNode = value;

      if (config.decimals !== undefined) {
        rendered *= 10 ** config.decimals;
        rendered = Math.round(rendered);
        rendered /= 10 ** config.decimals;
      }

      if (config.localize) {
        rendered = rendered.toLocaleString(locale);
      } else {
        rendered = rendered.toFixed(config.decimals);
      }

      if (units !== undefined) {
        rendered = literalsArray(strings.units[units], {
          value: <Text>{rendered}</Text>,
        });
      }

      return rendered;
    }

    switch (characteristics[config.name].type) {
      case CharacteristicType.Enum:
        return characteristic as string;

      case CharacteristicType.Number:
        return renderNumber(characteristic as number, config.units);

      case CharacteristicType.NumberList: {
        const values = (characteristic as number[]).map((value, index) => (
          <Fragment key={index}>
            {index > 0 && ", "}
            {renderNumber(value, undefined)}
          </Fragment>
        ));

        if (config.units === undefined) return values;

        return (
          <>
            {literalsArray(strings.units[config.units], {
              value: <Text>{values}</Text>,
            })}
          </>
        );
      }
    }
  }

  return renderCharacteristic;
}
