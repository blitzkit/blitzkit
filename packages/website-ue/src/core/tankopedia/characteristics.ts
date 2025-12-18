import {
  ShellUpgrageSingleChange_AttributeName,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";

export type CharacteristicOutput = number | string | null;

interface Characteristic {
  value: (helpers: {
    characteristic: (name: CharacteristicName) => CharacteristicOutput;
    attribute: (name: TankAttributeChange_AttributeName) => number;
    shell: (name: ShellUpgrageSingleChange_AttributeName) => number;
  }) => CharacteristicOutput;
}

export type CharacteristicName = keyof typeof characteristics;

export const characteristics = {
  gun_type: {
    value({ attribute }) {
      const isPump = attribute(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_IS_PUMP
      );

      if (isPump === 1) return "auto_reloader";

      const clipSize = attribute(
        TankAttributeChange_AttributeName.ATTRIBUTE_NAME_CLIP_SIZE
      );

      if (clipSize === 1) return "regular";

      return "auto_loader";
    },
  },

  damage: {
    value({ shell }) {
      return shell(
        ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_ARMOR_DAMAGE
      );
    },
  },

  dpm: {
    value({ characteristic }) {
      const damage = characteristic("damage");

      return 1;
    },
  },
} satisfies Record<string, Characteristic>;
