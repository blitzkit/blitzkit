export interface GunDefinitionsList {
  nextAvailableId: number;
  ids: Record<string, number>;
  shared: {
    [key: string]: {
      rotationSpeed: number;
      weight: number;
      reloadTime?: number;
      shotDispersionFactors: {
        turretRotation: number;
        afterShot: number;
        whileGunDamaged: number;
      };
      maxAmmo: number;
      aimingTime: number;
      shotDispersionRadius: number;
      userString: string;
      tags: string;
      level: number;
      pitchLimits: string;
      extraPitchLimits?: {
        front?: string;
        back?: string;
        transition?: number | number[];
      };
      burst?: { count: number; rate: number };
      clip?: { count: number; rate: number };
      shots: {
        [key: string]:
          | ""
          | {
              speed: number;
              piercingPower: string;
              maxDistance: number;
            };
      };
    };
  };
}
