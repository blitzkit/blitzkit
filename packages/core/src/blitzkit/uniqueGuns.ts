import { forEachRight } from 'lodash-es';
import { GunDefinition, TurretDefinition } from '../protos';

export function uniqueGuns(turrets: TurretDefinition[]) {
  const gunIds = new Set<number>();
  const guns: { turret: TurretDefinition; gun: GunDefinition }[] = [];

  forEachRight(turrets, (turret) => {
    forEachRight(turret.guns, (gun) => {
      if (!gunIds.has(gun.gunType!.value.base.id)) {
        gunIds.add(gun.gunType!.value.base.id);
        guns.push({ turret, gun });
      }
    });
  });

  return guns;
}
