import type { TankDefinition } from '@blitzkit/core';
import { times } from 'lodash-es';
import type { TankFilters } from '../../stores/tankFilters';

const SHELLS = times(3, (index) => index);

export function filterTank(filters: TankFilters, tank: TankDefinition) {
  return (
    (filters.tiers.length === 0 || filters.tiers.includes(tank.tier)) &&
    (filters.nations.length === 0 || filters.nations.includes(tank.nation)) &&
    (filters.classes.length === 0 || filters.classes.includes(tank.class)) &&
    (filters.types.length === 0 || filters.types.includes(tank.type)) &&
    (filters.testing === 'include' ||
      (filters.testing === 'only' && tank.testing) ||
      (filters.testing === 'exclude' && !tank.testing)) &&
    (filters.gunType.length === 0 ||
      (filters.gunType.includes('regular') &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === 'regular'),
        )) ||
      (filters.gunType.includes('auto_loader') &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === 'auto_loader'),
        )) ||
      (filters.gunType.includes('auto_reloader') &&
        tank.turrets.some((turret) =>
          turret.guns.some((gun) => gun.gun_type!.$case === 'auto_reloader'),
        ))) &&
    tank.turrets.some((turret) =>
      turret.guns.some((gun) =>
        SHELLS.every(
          (index) =>
            filters.shells[index] === null ||
            gun.gun_type!.value.base.shells[index] === undefined ||
            gun.gun_type!.value.base.shells[index].type ===
              filters.shells[index],
        ),
      ),
    )
  );
}
