import type { CharacteristicScript } from "../types/characteristics";

export function rawTerrainCoefficient(
  resistance: number,
  passabilityAttribute: string,
  driverCoefficient: number,
  script: CharacteristicScript,
) {
  let passabilityFactor = 1;
  let terrainResistanceFactor = 1;

  script("protagonist", "Grousers", (effect) => {
    passabilityFactor *=
      1 - (effect.bonusPercentage?.[passabilityAttribute] ?? 0) / 100;
  });

  script("protagonist", "AttributesModifier", (effect) => {
    passabilityFactor *=
      1 - (effect.attributes?.[passabilityAttribute] ?? 0) / 100;
  });

  script("protagonist", "AfterburnerAbility", (effect) => {
    terrainResistanceFactor *= effect.bonusValues?.terrainResistanceFactor ?? 1;
  });

  return (
    resistance *
    passabilityFactor *
    terrainResistanceFactor *
    driverCoefficient
  );
}
