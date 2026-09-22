interface ProvisionConsumableScript {
  attribute?: string;
  bonusValues?: BonusValuesClass | string;
  "#text": string;
  piercingFactors?: PiercingFactors;
  modulesHealthFactors?: ModulesHealthFactorsClass | string;
  rammingAbsorptionPercent?: number | string;
  chancesToHit?: ChancesToHitChancesToHit | string;
  largeCaliberHighExplosiveDamageFactor?: number;
  largeCaliberHighExplosivePiercingFactor?: number;
  maxHpBonusPercent?: number;
  modules?: string;
  visionRadiusPercentageBonus?: Bonus;
  activateWhenStillSec?: number;
  activateBonusFactor?: number;
  bonus?: Bonus;
  bonusPercentage?: BonusPercentage;
  enginePowerPercentageBonus?: Bonus;
  weight?: number;
  automatic?: boolean;
  cooldown?: number;
  duration?: number;
  enginePowerIncrease?: number;
  rotationSpeedFactor?: number;
  fwdSpeedLimitBias?: number;
  bkwdSpeedLimitBias?: number;
  shotDispersionAngleFactor?: number;
  aimingTimeFactor?: number;
  clipReloadTimeFactor?: number;
  gunReloadTimeFactor?: number;
  shieldCoef?: number;
  minDamageFactor?: number;
  maxDamageFactor?: number;
  shotEffect?: string;
  deactivateStates?: number;
  activateStates?: number;
  contusionChances?: string;
  abortVelocity?: number;
  distance?: number;
  activationDamageFactor?: number;
  damageFactor?: number;
  startCooldown?: number;
  keepSpoted?: boolean;
  conflictExtras?: string;
  effectExtraName?: string;
  clientEffectVariant?: string;
  range?: number;
  healthFactor?: number;
  burstForce?: number;
  damageFactors?: string;
  flyTime?: number;
  distanceOffset?: number;
  timeSeconds?: number;
  extrasMustBeStopped?: string;
  breakTracks?: boolean;
  minAngleDegrees?: number;
  maxAngleDegrees?: number;
  attributes?: { [key: string]: number };
  acceleration?: number;
  burstRange?: number;
  burstDamagePercent?: number;
  projectileSpeed?: number;
  healWaveDelay?: number;
  healWavesCount?: number;
  healFactorPercent?: number;
  selfHealReducePercent?: number;
  shieldDuration?: number;
  targetExtrasMustBeStopped?: string;
  maxHealthSelfDamageFactor?: number;
  maxHealthDamageFactor?: number;
  disableTracksCollisionDamage?: boolean;
  maxHealthDamagePercent?: number;
  poisonTicks?: number;
  poisonTickDelay?: number;
  effectDuration?: number;
  radius?: number;
  attractorMass?: number;
  hpStockPercent?: number;
  invisibilityInMovingFactor?: number;
  maxBonusSources?: number;
  sixthSenseDelay?: number;
  stopObservingDelayFactor?: number;
  revengeDamagePercentage?: number;
  timeForComeBack?: number;
  simpleMode?: boolean;
  respawns?: Respawns;
  curseStrength?: number;
  curseReduction?: number;
  curseHeal?: number;
  explodeDamagePercent?: number;
  damageReductionPercent?: number;
  respawnBoost?: RespawnBoost;
  slowDebuff?: SlowDebuff;
  maxHealthFactor?: Bonus;
  minRammingDamageMaxHealthRatio?: number;
  minRammingDamageCooldown?: number;
  optDeviceRammingDamageOverride?: number;
}

interface Bonus {
  lightTank: number;
  mediumTank: number;
  heavyTank: number;
  "AT-SPG": number;
  SPG?: number;
}

interface BonusPercentage {
  rotationSpeedFactor?: number;
  firmGroundPassabilityIncrease?: number;
  softGroundPassabilityIncrease?: number;
  mediumGroundPassabilityIncrease?: number;
}

interface BonusValuesClass {
  percent?: number;
  value?: number;
  projectileSpeedFactor?: number;
  piercingPenaltyFactor500m?: number;
  circularVisionRadiusIncrease?: number;
  upperPitchLimitIncrease?: number;
  lowerPitchLimitIncrease?: number;
  enginePowerIncrease?: number;
  gunReloadSpeedIncrease?: number;
  damageReductionPercent?: number;
  rammingDamageFactor?: number;
  sacrificeLoss?: number;
  damagePercentBonus?: number;
  enginePowerFactor?: number;
  maxVelocityFactor?: number;
  terrainResistanceFactor?: number;
  chassisHealthFactor?: number;
  rotationSpeedFactor?: number;
  damageReflectionPercent?: number;
  enginePowerAbilityFactor?: number;
  speedLimitAbilityBonus?: number;
  crewLevelIncrease?: number;
  factor?: number;
  turretRotationSpeedIncrease?: number;
  crewChanceToHitFactor?: number;
  repairSpeedIncrease?: number;
  fireProtectionIncrease?: number;
  explosivesHealthIncrease?: number;
  fwdSpeedLimitBias?: number;
  bkwdSpeedLimitBias?: number;
  lifestealFactor?: number;
  lifestealRandomFactor?: number;
  killHealFactor?: number;
  healFactor?: number;
  healRandomFactor?: number;
  dealingRammingDamageFactor?: number;
  gunReloadingBonus?: number;
  gunAimingTimeBonus?: number;
  visionRadiusBonus?: number;
  shotDispersionAngleFactor?: number;
  aimingTimeFactor?: number;
  timeBetweenShots?: number;
  increasedDamageChance?: number;
  increaseDamageFactor?: number;
  gunReloadFactor?: number;
  commonDamageFactor?: number;
  speedLimitsFactor?: number;
  maxHealthPercentBonus?: number;
  maxStaticsDamagePercent?: number;
  chancesToHit?: BonusValuesChancesToHit;
  modulesMaxHpFactors?: ModulesMaxHPFactors;
  modulesMaxRegenHpFactors?: ModulesMaxHPFactors;
  item?: BonusValuesItem[];
}

interface BonusValuesChancesToHit {
  modules: PurpleModules;
}

interface PurpleModules {
  engineHealth: number;
  fuelTankHealth: number;
  turretRotatorHealth: number;
  surveyingDeviceHealth: number[];
  ammoBayHealth: number;
}

interface BonusValuesItem {
  commonDamageFactor: number;
  reloadSpeedFactor: number;
}

interface ModulesMaxHPFactors {
  modules: ModulesMaxHPFactorsModules;
}

interface ModulesMaxHPFactorsModules {
  ammoBayHealth: number;
}

interface ChancesToHitChancesToHit {
  crew: number;
  modules: FluffyModules;
}

interface FluffyModules {
  engineHealth: number;
  ammoBayHealth: number;
  commanderHealth: number;
  driverHealth: number;
  gunner1Health: number;
  gunner2Health: number;
  loader1Health: number;
  loader2Health: number;
}

interface ModulesHealthFactorsClass {
  modules: ModulesHealthFactorsModules;
}

interface ModulesHealthFactorsModules {
  leftTrackHealth: number;
  rightTrackHealth: number;
  fuelTankHealth: number;
  ammoBayHealth: number;
}

interface PiercingFactors {
  ARMOR_PIERCING: number;
  HOLLOW_CHARGE: number;
  HIGH_EXPLOSIVE: number;
  ARMOR_PIERCING_HE: number;
  ARMOR_PIERCING_CR: number;
}

interface RespawnBoost {
  duration: number;
  enginePowerFactor: number;
  speedLimitAbilityBonus: number;
}

interface Respawns {
  respawn: Respawn[];
}

interface Respawn {
  respawnIndex: number;
  bonusDamage: number;
  bonusReloadSpeed: number;
  bonusMaxSpeed: number;
  bonusEnginePower: number;
}

interface SlowDebuff {
  item: SlowDebuffItem[];
}

interface SlowDebuffItem {
  duration: number;
  enginePowerFactor: Bonus;
  speedLimitsFactor: Bonus;
}
