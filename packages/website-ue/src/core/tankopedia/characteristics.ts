import {
  ShellUpgrageSingleChange_AttributeName,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";

export type CharacteristicOutput = number | null;

type Characteristic = (helpers: {
  characteristic: (
    name: CharacteristicName,
    error?: boolean
  ) => CharacteristicOutput;
  attribute: (
    name: TankAttributeChange_AttributeName,
    error?: boolean
  ) => number;
  shell: (
    name: ShellUpgrageSingleChange_AttributeName,
    error?: boolean
  ) => number;
}) => CharacteristicOutput;

export type CharacteristicName = keyof typeof characteristics;

export enum GunType {
  Regular,
  AutoLoader,
  AutoReloader,
}

export const characteristics = {
  gun_type({ attribute }) {
    const isPump = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP
    );

    if (isPump === 1) return GunType.AutoReloader;

    const clipSize = attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
    );

    if (clipSize === 1) return GunType.Regular;

    return GunType.AutoLoader;
  },

  damage({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_ARMOR_DAMAGE
    );
  },

  module_damage({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_MODULE_DAMAGE
    );
  },

  penetration({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_PIERCING_POWER
    );
  },

  reload({ characteristic, attribute }) {
    const gunType = characteristic("gun_type")!;

    if (gunType !== GunType.Regular) return null;

    return attribute(
      TankAttributeChange_AttributeName.ATTRIBUTE_NAME_RELOAD_TIME
    );
  },

  dpm({ characteristic }) {
    let dps: number;
    const gunType = characteristic("gun_type")!;
    const damage = characteristic("damage")!;

    switch (gunType) {
      case GunType.Regular: {
        const reload = characteristic("reload")!;
        dps = damage / reload;
        break;
      }

      default:
        throw new Error("Unknown gun type");
    }

    return 60 * dps;
  },

  caliber({ shell }) {
    return shell(ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_CALIBER);
  },

  normalization({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_NORMALIZATION
    );
  },

  ricochet({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_RICOCHET_ANGLE
    );
  },

  shell_velocity({ shell }) {
    return shell(ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_SPEED);
  },

  shell_range({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_MAX_DISTANCE
    );
  },

  shell_capacity({ shell }) {
    return shell(
      ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_MAX_COUNT
    );
  },
} satisfies Record<string, Characteristic>;
