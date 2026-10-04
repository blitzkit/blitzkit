import { blitzkitToBlitzShellKind } from "@blitzkit/core";
import { ShellType } from "@blitzkit/protos";
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
    compute({ shell, environment, equalizer, script, gun }) {
      let coefficient = 1;

      if (environment.equalize) coefficient *= equalizer.damage;

      // tungsten shells
      script("protagonist", "TungstenTip", (effect) => {
        coefficient *= (effect.minDamageFactor + effect.maxDamageFactor) / 2;
      });

      // reactive armor
      script("antagonist", "ShieldKit", (effect) => {
        if (shell.type === ShellType.SHELL_TYPE_HE) return;
        coefficient *= 1 - effect.shieldCoef;
      });

      // dynamic armour system
      script("antagonist", "ArmorMover", (effect) => {
        coefficient *= 1 - effect.bonusValues!.damageReductionPercent / 100;
      });

      // spall liner
      script("antagonist", "AntiHighExplosive", (effect) => {
        if (shell.type !== ShellType.SHELL_TYPE_HE) return;
        coefficient *= effect.bonusValues!.factor;
      });

      if (gun.assault_ranges && gun.assault_ranges.types.includes(shell.type)) {
        const range = gun.assault_ranges.ranges.find(
          ({ distance }) => distance >= environment.distance,
        );

        if (range) coefficient *= range.factor;
      }

      return coefficient * shell.armor_damage;
    },
  },

  module_damage: {
    type: CharacteristicType.Number,
    compute({ shell, script }) {
      let coefficient = 1;

      // tungsten shells
      script("protagonist", "TungstenTip", (effect) => {
        coefficient *= (effect.minDamageFactor + effect.maxDamageFactor) / 2;
      });

      return coefficient * shell.module_damage;
    },
  },

  penetration: {
    type: CharacteristicType.Number,
    compute({ shell, script }) {
      let coefficient = 1;

      script("protagonist", "CalibratedShells", (effect) => {
        coefficient +=
          effect.piercingFactors![blitzkitToBlitzShellKind[shell.type]] / 100;
      });

      return coefficient * shell.penetration!.near;
    },
  },

  reload: {
    type: CharacteristicType.Number,

    should_render({ gun }) {
      return gun.gun_type!.$case !== "auto_reloader";
    },

    compute({ gun, script }) {
      // should never happen! just for typescript
      if (gun.gun_type!.$case === "auto_reloader") return -Infinity;

      let coefficient = 1;

      script("protagonist", "miscAttrs/gunReloadTimeFactor", (effect) => {
        coefficient += effect.bonusValues!.percent / 100;
      });

      if (gun.gun_type!.$case === "regular") {
        return coefficient * gun.gun_type!.value.reload;
      }

      return gun.gun_type!.value.clip_reload;
    },
  },
} satisfies Record<string, Characteristic>;
