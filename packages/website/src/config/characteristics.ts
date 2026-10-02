import {
  CharacteristicType,
  type Characteristic,
} from "../types/characteristics";

export const characteristics = {
  gun_type: {
    type: CharacteristicType.Enum,
    compute({ gun }) {
      return gun.gun_type!.$case;
    },
  },

  clip_size: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case !== "regular";
    },

    compute({ gun }) {
      if (gun.gun_type!.$case === "regular") return 1;
      return gun.gun_type!.value.shell_count;
    },
  },

  damage: {
    type: CharacteristicType.Number,
    compute({ shell }) {
      return shell.armor_damage;
    },
  },

  module_damage: {
    type: CharacteristicType.Number,
    compute({ shell }) {
      return shell.module_damage;
    },
  },
} satisfies Record<string, Characteristic>;
