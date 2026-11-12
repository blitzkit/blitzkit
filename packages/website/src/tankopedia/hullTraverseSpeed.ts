import type {
  CharacteristicContext,
  CharacteristicScript,
} from "../types/characteristics";

function hullTraverseRotationCoefficient(
  driverCoefficient: number,
  virtuosoSkill: number,
  script: CharacteristicScript,
) {
  let coefficient = 1 + virtuosoSkill / 100;
  let rotationSpeedFactor = 1;

  script("protagonist", "StaticPhysicsAttrsModifier", (effect) => {
    coefficient += (effect.bonusPercentage?.rotationSpeedFactor ?? 0) / 100;
  });

  script("protagonist", "ImprovedAfterburning", (effect) => {
    rotationSpeedFactor *= effect.rotationSpeedFactor ?? 1;
  });

  script("protagonist", "AfterburnerAbility", (effect) => {
    rotationSpeedFactor *= effect.bonusValues?.rotationSpeedFactor ?? 1;
  });

  return driverCoefficient * coefficient * rotationSpeedFactor;
}

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
  const enginePower =
    (engine.power * (characteristic("_engine_power_coefficient") as number)) /
    stockEngine.power;
  const rotationSpeed = hullTraverseRotationCoefficient(
    progressive("driver"),
    environment.skills.virtuoso ?? 0,
    script,
  );

  return (
    enginePower *
    track.traverse_speed *
    rotationSpeed *
    (terrainResistance / rawTerrainResistance) *
    (stockWeight / weight)
  );
}
