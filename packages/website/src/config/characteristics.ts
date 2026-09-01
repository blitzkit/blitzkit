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

  assault_damage_coefficient: {
    type: CharacteristicType.Number,

    compute({ gun, shell, assault_distance }) {
      if (
        !gun.assault_ranges ||
        !gun.assault_ranges.types.includes(shell.type)
      ) {
        return 1;
      }

      return (
        gun.assault_ranges.ranges.find(
          ({ distance }) => distance >= assault_distance,
        )?.factor ?? 0
      );
    },
  },

  armor_damage_coefficient: {
    type: CharacteristicType.Number,

    compute() {
      let coefficient = 1;

      return coefficient;
    },
  },

  damage: {
    type: CharacteristicType.Number,
    compute({ characteristic, shell, equalizer }) {
      let coefficient = 1;

      coefficient *= characteristic("armor_damage_coefficient") as number;
      coefficient *= characteristic("assault_damage_coefficient") as number;
      coefficient *= equalizer.damage;

      return coefficient * shell.armor_damage;
    },
  },
} satisfies Record<string, Characteristic>;
