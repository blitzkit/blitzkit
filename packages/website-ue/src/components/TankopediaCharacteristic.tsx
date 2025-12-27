import type { CharacteristicOutput } from "../core/tankopedia/characteristics";
import type { CharacteristicRenderConfig } from "../core/tankopedia/characteristicsOrder";
import { renderCharacteristic } from "../core/tankopedia/renderCharacteristic";

interface Props {
  characteristic: CharacteristicOutput;
  others: CharacteristicOutput[];
  config: CharacteristicRenderConfig;
}

export function TankopediaCharacteristic({
  characteristic,
  others,
  config,
}: Props) {
  if (characteristic === null) return null;

  const rendered = renderCharacteristic(characteristic, config);

  return (
    <p>
      {config.name}: {rendered} {config.units && `${config.units}`} (1 /{" "}
      {others.length})
    </p>
  );
}
