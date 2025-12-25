import type { CharacteristicOutput } from "./characteristics";
import type { CharacteristicRenderConfig } from "./characteristicsOrder";

export function renderCharacteristic(
  characteristic: CharacteristicOutput,
  config: CharacteristicRenderConfig
): string | null {
  if (characteristic === null) return null;

  if (typeof characteristic === "number") {
    if (Number.isFinite(characteristic)) {
      if (config.decimals === undefined) {
        return characteristic.toString();
      }

      return characteristic.toFixed(config.decimals);
    }

    return `${characteristic < 0 ? "-" : ""}∞`;
  }

  return characteristic.map((c) => renderCharacteristic(c, config)).join(", ");
}
