export type ProvisionConsumableScript =
  | {
      "#text": "Extinguisher";
      cooldown: number;
      automatic: boolean;
    }
  | {
      "#text": "Repairkit";
      cooldown: number;
    }
  | {
      "#text": "Afterburning";
      cooldown: number;
      duration: number;
      bonusValues: {
        enginePowerIncrease: number;
      };
    }
  | {
      "#text": "Berserk";
      cooldown: number;
      duration: number;
      bonusValues: {
        gunReloadSpeedIncrease: number;
      };
    }
  | {
      "#text": "Recoverkit";
      cooldown: number;
    }
  | {
      "#text": "ImprovedAfterburning";
      cooldown: number;
      duration: number;
      enginePowerIncrease: number;
      rotationSpeedFactor: number;
      fwdSpeedLimitBias: number;
      bkwdSpeedLimitBias: number;
    }
  | {
      "#text": "FireControlSystem";
      cooldown: number;
      duration: number;
      shotDispersionAngleFactor: number;
      aimingTimeFactor: number;
    }
  | {
      "#text": "NewAutoloader";
      cooldown: number;
      duration: number;
      clipReloadTimeFactor: number;
      gunReloadTimeFactor: number;
    }
  | {
      "#text": "ShieldKit";
      cooldown: number;
      duration: number;
      shieldCoef: number;
    }
  | {
      "#text": "TungstenTip";
      cooldown: number;
      duration: number;
      minDamageFactor: number;
      maxDamageFactor: number;
      shotEffect: "dangerousTracer";
    }
  | {
      "#text": "ArmorMover";
      cooldown: number;
      duration: number;
      deactivateStates: number;
      activateStates: number;
      bonusValues: {
        damageReductionPercent: number;
      };
    }
  | {
      "#text": "ImprovedAfterburning";
      cooldown: number;
      duration: number;
      enginePowerIncrease: number;
      rotationSpeedFactor: number;
      fwdSpeedLimitBias: number;
      bkwdSpeedLimitBias: number;
    }
  | {
      "#text": "Stimulator";
      bonusValues: {
        crewLevelIncrease: number;
      };
    }
  | {
      "#text": "AntiHighExplosive";
      bonusValues: {
        factor: number;
      };
    }
  | {
      "#text": "Fuel";
      bonusValues: {
        enginePowerIncrease: number;
        turretRotationSpeedIncrease: number;
      };
    }
  | {
      "#text": "SafetySet";
      bonusValues: {
        crewChanceToHitFactor: number;
        repairSpeedIncrease: number;
        fireProtectionIncrease: number;
        explosivesHealthIncrease: number;
      };
    }
  | {
      "#text": "SmallHPStock";
      hpStockPercent: number;
    }
  | {
      "#text": "GearOil";
      bonusValues: {
        fwdSpeedLimitBias: number;
        bkwdSpeedLimitBias: number;
        enginePowerIncrease: number;
      };
    }
  | {
      "#text": "GunPowder";
      bonusValues: {
        projectileSpeedFactor: number;
      };
    }
  | {
      "#text": "AttributesModifier";
      attributes: {
        firmGroundPassabilityIncrease: number;
        mediumGroundPassabilityIncrease: number;
        repairSpeedFactor: number;
      };
    };
