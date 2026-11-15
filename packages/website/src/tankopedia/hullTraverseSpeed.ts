import type { CharacteristicContext } from "../types/characteristics";

export function hullTraverseSpeed(
  rawTerrainResistance: number,
  context: CharacteristicContext,
) {
  const {
    tank,
    engine,
    track,
    turret,
    gun,
    progressive,
    script,
    augment,
    environment,
    characteristic,
  } = context;
  const terrainResistance = track.resistance_hard;
  const stockEngine = tank.engines[0];
  const stockTrack = tank.tracks[0];
  const stockTurret = tank.turrets[0];
  const stockGun = stockTurret.guns[0];
  const stockWeight =
    tank.weight +
    stockEngine.weight +
    stockTrack.weight +
    stockTurret.weight +
    stockGun.weight;
  const weight =
    tank.weight + engine.weight + track.weight + turret.weight + gun.weight;
  // Engine augments are flat, so this goes through the finished stat
  const enginePower =
    (characteristic("engine_power") as number) / stockEngine.power;
  const virtuosoSkill = environment.skills.virtuoso ?? 0;
  let rotationCoefficient = 1 + virtuosoSkill / 100;
  let rotationSpeedFactor = 1;

  augment("HULL_ROTATION_SPEED_FACTOR_BONUS", (value) => {
    rotationCoefficient += value;
  });

  script("protagonist", "StaticPhysicsAttrsModifier", (effect) => {
    rotationCoefficient +=
      (effect.bonusPercentage?.rotationSpeedFactor ?? 0) / 100;
  });

  script("protagonist", "ImprovedAfterburning", (effect) => {
    rotationSpeedFactor *= effect.rotationSpeedFactor ?? 1;
  });

  script("protagonist", "AfterburnerAbility", (effect) => {
    rotationSpeedFactor *= effect.bonusValues?.rotationSpeedFactor ?? 1;
  });

  const rotationSpeed =
    progressive("driver") * rotationCoefficient * rotationSpeedFactor;

  return (
    enginePower *
    track.traverse_speed *
    rotationSpeed *
    (terrainResistance / rawTerrainResistance) *
    (stockWeight / weight)
  );
}
