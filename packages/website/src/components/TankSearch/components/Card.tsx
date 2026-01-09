import {
  normalizeBoundingBox,
  resolveDpm,
  unionBoundingBox,
  type TankDefinition,
} from '@blitzkit/core';
import { useMemo } from 'react';
import { awaitableModelDefinitions } from '../../../core/awaitables/modelDefinitions';
import { resolveReload } from '../../../core/blitzkit/resolveReload';
import { TankSort } from '../../../stores/tankopediaSort';
import { TankCard } from '../../TankCard';

interface TankSearchCardProps {
  tank: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
}

const modelDefinitions = await awaitableModelDefinitions;

export function TankSearchCard({ tank, onSelect }: TankSearchCardProps) {
  const by = TankSort.use((state) => state.by);
  const discriminator = useMemo(() => {
    if (by.startsWith('meta')) return undefined;

    const turret = tank.turrets.at(-1)!;
    const gun = turret.guns.at(-1)!;
    const shell0 = gun.shells[0];
    const shell1 = gun.shells[1];
    const shell2 = gun.shells[2];
    const tracks = tank.tracks.at(-1)!;
    const engine = tank.engines.at(-1)!;
    const tankModelDefinition = modelDefinitions.models[tank.id];
    const turretModelDefinition = tankModelDefinition.turrets[turret.id];
    const gunModelDefinition = turretModelDefinition.guns[gun.id];

    switch (by) {
      case 'fire.aimTime':
        return gun.aim_time.toFixed(2);
      case 'fire.caliber':
        return shell0.caliber.toFixed(0);
      case 'fire.damage':
        return shell0.armor_damage.toFixed(0);
      case 'fire.moduleDamage':
        return shell0.module_damage.toFixed(0);
      case 'fire.dispersionMoving':
        return tracks.dispersion_move.toFixed(3);
      case 'fire.dispersionStill':
        return gun.dispersion_base.toFixed(3);
      case 'fire.dpm':
        return resolveDpm(gun, shell0).toFixed(0);
      case 'fire.dpmPremium':
        return shell1 ? resolveDpm(gun, shell1).toFixed(0) : '--';
      case 'fire.reload':
        return resolveReload(gun).toFixed(2);
      case 'fire.standardPenetration':
        return shell0.penetration.near.toFixed(0);
      case 'fire.premiumPenetration':
        return shell1 ? shell1.penetration.near.toFixed(0) : '--';
      case 'fire.tertiaryPenetration':
        return shell1 ? shell2.penetration.near.toFixed(0) : '--';
      case 'fire.shellVelocity':
        return shell0.velocity.toFixed(0);
      case 'fire.shellCapacity':
        return gun.shell_capacity.toFixed(0);
      case 'fire.shellRange':
        return shell0.range.toFixed(0);
      case 'fire.gunDepression':
        return (
          gunModelDefinition.pitch.max +
          (tankModelDefinition.initial_turret_rotation?.pitch ?? 0)
        ).toFixed(1);
      case 'fire.gunElevation':
        return (
          -gunModelDefinition.pitch.min -
          (tankModelDefinition.initial_turret_rotation?.pitch ?? 0)
        ).toFixed(1);
      case 'maneuverability.forwardsSpeed':
        return tank.speed_forwards.toFixed(0);
      case 'maneuverability.backwardsSpeed':
        return tank.speed_backwards.toFixed(0);
      case 'maneuverability.power':
        return engine.power.toFixed(0);
      case 'maneuverability.powerToWeight':
        return (
          (1000 * engine.power) /
          (tank.weight +
            engine.weight +
            tracks.weight +
            turret.weight +
            gun.weight)
        ).toFixed(1);
      case 'maneuverability.weight':
        return (
          (tank.weight +
            engine.weight +
            tracks.weight +
            turret.weight +
            gun.weight) /
          1000
        ).toFixed(1);
      case 'maneuverability.traverseSpeed':
        return tracks.traverse_speed.toFixed(1);
      case 'survivability.health':
        return (tank.health + turret.health).toFixed(0);
      case 'survivability.viewRange':
        return turret.view_range.toFixed(0);
      case 'survivability.camouflageStill':
        return (tank.camouflage_still * 100).toFixed(0);
      case 'survivability.camouflageMoving':
        return (tank.camouflage_moving * 100).toFixed(0);
      case 'survivability.camouflageShooting':
        return (tank.camouflage_still * gun.camouflage_loss * 100).toFixed(0);
      case 'survivability.volume': {
        const dimensions = normalizeBoundingBox(
          unionBoundingBox(
            tankModelDefinition.bounding_box,
            turretModelDefinition.bounding_box,
          ),
        );

        return (dimensions.x * dimensions.y * dimensions.z).toFixed(0);
      }

      case 'survivability.length': {
        const bounds = normalizeBoundingBox(
          unionBoundingBox(
            tankModelDefinition.bounding_box,
            turretModelDefinition.bounding_box,
          ),
        );

        return Math.max(bounds.x, bounds.y, bounds.z).toFixed(0);
      }
    }
  }, [by]);

  return (
    <TankCard
      key={tank.id}
      onTankSelect={onSelect}
      tank={tank}
      discriminator={discriminator}
    />
  );
}
