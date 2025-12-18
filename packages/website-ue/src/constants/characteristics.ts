import {
  ShellUpgrageSingleChange_AttributeName,
  TankAttributeChange_AttributeName,
} from "@protos/blitz_static_tank_upgrade_single_stage";

export enum CharacteristicsGroup {
  Firepower = "firepower",
  Maneuverability = "maneuverability",
  Survivability = "survivability",
  Miscellaneous = "miscellaneous",
}

interface Characteristic {
  render: (helpers: {
    characteristic: (name: CharacteristicName) => number;
    attribute: (name: TankAttributeChange_AttributeName) => number;
    shell: (name: ShellUpgrageSingleChange_AttributeName) => number;
  }) => number | string | null;
}

type CharacteristicName = keyof typeof characteristics;

type CharacteristicsOrder = {
  group: CharacteristicsGroup;
  characteristics: CharacteristicName[];
}[];

export const characteristics = {
  gun_type: {
    render({ attribute }) {
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
    render({ shell }) {
      return shell(
        ShellUpgrageSingleChange_AttributeName.ATTRIBUTE_NAME_ARMOR_DAMAGE
      );
    },
  },

  dpm: {
    render({ characteristic }) {
      const damage = characteristic("damage");

      return 1;
    },
  },
} satisfies Record<string, Characteristic>;

export const characteristicsOrder: CharacteristicsOrder = [
  {
    group: CharacteristicsGroup.Firepower,
    characteristics: ["gun_type", "dpm"],
  },
  {
    group: CharacteristicsGroup.Maneuverability,
    characteristics: [],
  },
  {
    group: CharacteristicsGroup.Survivability,
    characteristics: [],
  },
  {
    group: CharacteristicsGroup.Miscellaneous,
    characteristics: [],
  },
];
