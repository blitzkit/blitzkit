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
    compute({ characteristic, gun, shell, equalizer, assault_distance }) {
      let coefficient = 1;

      if (gun.assault_ranges && gun.assault_ranges.types.includes(shell.type)) {
        const match = gun.assault_ranges.ranges.find(
          ({ distance }) => distance >= assault_distance,
        );

        if (match !== undefined) {
          coefficient *= match.factor;
        }
      }

      coefficient *= equalizer.damage;

      return coefficient * shell.armor_damage;
    },
  },
} satisfies Record<string, Characteristic>;
