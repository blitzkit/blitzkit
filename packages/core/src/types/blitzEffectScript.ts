export type BlitzEffectScript = RSN & {
  "#text": string;
  attribute?: string;

  cooldown?: number;
  duration?: number;
  startCooldown?: number;

  automatic?: boolean;
  keepSpoted?: boolean;
  breakTracks?: boolean;
  disableTracksCollisionDamage?: boolean;
  simpleMode?: boolean;

  shotEffect?: string;
  contusionChances?: string;
  modules?: string;
  damageFactors?: string;

  extrasMustBeStopped?: string;
  targetExtrasMustBeStopped?: string;
  conflictExtras?: string;
  effectExtraName?: string;
  clientEffectVariant?: string;

  piercingFactors?: RSN;
  visionRadiusPercentageBonus?: RSN;
  bonus?: RSN;
  enginePowerPercentageBonus?: RSN;
  bonusPercentage?: RSN;
  attributes?: RSN;
  respawnBoost?: RSN;
  maxHealthFactor?: RSN;

  bonusValues?: BonusValues;
  modulesHealthFactors?: ModuleConstants;
  chancesToHit?: ChangesToHit;
  respawns?: Respawns;
  slowDebuff?: SlowDebuff;
};

type RSN = Record<string, number>;

type BonusValues = RSN & {
  chancesToHit?: ModuleConstants;
  modulesMaxHpFactors?: ModuleConstants;
  modulesMaxRegenHpFactors?: ModuleConstants;
  item?: RSN[];
};

interface ModuleConstants {
  modules: Record<string, number | number[]>;
}

interface ModulesMaxHPFactorsModules {
  ammoBayHealth: number;
}

interface ChangesToHit {
  crew: number;
  modules: RSN;
}

interface Respawns {
  respawn: RSN;
}

interface SlowDebuff {
  item: SlowDebuffItem[];
}

interface SlowDebuffItem {
  duration: number;
  enginePowerFactor: RSN;
  speedLimitsFactor: RSN;
}
