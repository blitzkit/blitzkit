import { renderCharacteristic } from "../hooks/useCharacteristicRenderer";
import type { CharacteristicOutput } from "../tankopedia/characteristics";
import type { CharacteristicRenderConfig } from "../tankopedia/characteristicsOrder";

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
