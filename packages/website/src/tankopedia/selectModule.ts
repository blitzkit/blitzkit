import { ModuleType, type TankDefinition, type Unlock } from "@blitzkit/protos";
import type { TankState } from "./tankState";

type ModuleState = Pick<
  TankState,
  "turret" | "gun" | "shell" | "engine" | "track"
>;

// Selecting a turret or gun may force the other to change with it
export function selectModule(
  draft: ModuleState,
  tank: TankDefinition,
  unlock: Unlock,
) {
  switch (unlock.type) {
    case ModuleType.MODULE_TYPE_TURRET: {
      const turret = tank.turrets.find((t) => t.id === unlock.id)!;
      const gun =
        turret.guns.find((g) => g.id === draft.gun) ?? turret.guns.at(-1)!;

      draft.turret = turret.id;
      draft.gun = gun.id;
      draft.shell = gun.shells[0].id;
      break;
    }

    case ModuleType.MODULE_TYPE_GUN: {
      const current = tank.turrets.find((t) => t.id === draft.turret)!;
      const turret = current.guns.some((g) => g.id === unlock.id)
        ? current
        : tank.turrets.find((t) => t.guns.some((g) => g.id === unlock.id))!;
      const gun = turret.guns.find((g) => g.id === unlock.id)!;

      draft.turret = turret.id;
      draft.gun = gun.id;
      draft.shell = gun.shells[0].id;
      break;
    }

    case ModuleType.MODULE_TYPE_ENGINE:
      draft.engine = unlock.id;
      break;

    case ModuleType.MODULE_TYPE_TRACKS:
      draft.track = unlock.id;
      break;
  }
}
