import { BlitzModuleType } from "@blitzkit/core";

export interface VehicleDefinitions {
  invisibility: {
    moving: number;
    still: number;
    firePenalty: number;
  };
  crew: Record<BlitzCrewType, string | string[]>;
  speedLimits: {
    forward: number;
    backward: number;
  };
  consumableSlots: number;
  provisionSlots: number;
  optDevicePreset: string | string[];
  hull: {
    armor: VehicleDefinitionArmor;
    turretPositions: { turret: string };
    turretInitialRotation?: { yaw: 0; pitch: 6.5; roll: 0 };
    maxHealth: number;
    weight: number;
  };
  chassis: {
    [key: string]: {
      unlocks: UnlocksListing;
      weight: number;
      terrainResistance: string;
      rotationSpeed: number;
      userString: string;
      shotDispersionFactors: {
        vehicleMovement: number;
        vehicleRotation: number;
      };
      level: number;
      hullPosition: string;
      armor: {
        leftTrack:
          | number
          | {
              chanceToHitByProjectile: number;
              chanceToHitByExplosion: number;
              "#text": number;
            };
        rightTrack:
          | number
          | {
              chanceToHitByProjectile: number;
              chanceToHitByExplosion: number;
              "#text": number;
            };
      };
    };
  };
  engines: {
    [key: string]: {
      unlocks: UnlocksListing;
    };
  };
  turrets0: {
    [key: string]: {
      unlocks: UnlocksListing;
      rotationSpeed: number;
      weight: number;
      circularVisionRadius: number;
      maxHealth: number;
      armor: VehicleDefinitionArmor;
      userString: string;
      level: number;
      yawLimits: string | string[];
      gunPosition: string | string[];
      models: { undamaged: string };
      hitTester: {
        collisionModel: string;
      };
      guns: {
        [key: string]: {
          unlocks: UnlocksListing;
          armor: VehicleDefinitionArmor & {
            gun?:
              | number
              | {
                  chanceToHitByProjectile: number;
                  chanceToHitByExplosion: number;
                  "#text": number;
                };
          };
          invisibilityFactorAtShot: number | number[];
          reloadTime: number;
          aimingTime?: number;
          shotDispersionRadius: number;
          shotDispersionFactors?: {
            turretRotation: number;
            afterShot: number;
            whileGunDamaged: number;
          };
          maxAmmo: number;
          extraPitchLimits?: {
            front?: string;
            back?: string;
            transition?: number | number[];
          };
          pitchLimits?: string | string[];
          pumpGunMode?: boolean;
          pumpGunReloadTimes?: string;
          clip?: { count: number; rate: number };
          burst?: { count: number; rate: number };
          models: { undamaged: string };
          extras?: {
            trayShell?: {
              kinds: string;
              sectors: Record<
                string,
                { id: number; distance: number; factor: number }[]
              >;
            };
          };
        };
      };
    };
  };
  extras?: {
    armorsStatesController?: {
      state: [
        {
          id: 0;
          armors: string;
          type: "default";
          enabled: true;
          factorsModifiers: "";
          default: "";
        },
        {
          id: 1;
          armors: string;
          type: "default";
          enabled: false;
          factorsModifiers: "";
        },
      ];
    };
  };
}

export type BlitzCrewType =
  | "commander"
  | "radioman"
  | "gunner"
  | "driver"
  | "loader";

export type UnlocksListing = BlitzModuleType | undefined;
