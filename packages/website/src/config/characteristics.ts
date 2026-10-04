import { blitzkitToBlitzShellKind } from "@blitzkit/core";
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
    compute({ shell, environment, equalizer, script }) {
      let coefficient = 1;

      if (environment.equalize) coefficient *= equalizer.damage;

      script("TungstenTip", (effect) => {
        coefficient *= (effect.minDamageFactor + effect.maxDamageFactor) / 2;
      });

      return coefficient * shell.armor_damage;
    },
  },

  module_damage: {
    type: CharacteristicType.Number,
    compute({ shell, script }) {
      let coefficient = 1;

      script("TungstenTip", (effect) => {
        coefficient *= (effect.minDamageFactor + effect.maxDamageFactor) / 2;
      });

      return coefficient * shell.module_damage;
    },
  },

  penetration: {
    type: CharacteristicType.Number,
    compute({ shell, script }) {
      let coefficient = 1;

      script("CalibratedShells", (effect) => {
        coefficient *=
          1 +
          effect.piercingFactors![blitzkitToBlitzShellKind[shell.type]] / 100;
      });

      return coefficient * shell.penetration!.near;
    },
  },
} satisfies Record<string, Characteristic>;
