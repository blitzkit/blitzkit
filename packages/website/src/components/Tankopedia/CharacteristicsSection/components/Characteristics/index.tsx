import { Flex } from '@radix-ui/themes';
import { useEffect } from 'react';
import { awaitableEquipmentDefinitions } from '../../../../../core/awaitables/equipmentDefinitions';
import { awaitableProvisionDefinitions } from '../../../../../core/awaitables/provisionDefinitions';
import { applyPitchYawLimits } from '../../../../../core/blitz/applyPitchYawLimits';
import { tankCharacteristics } from '../../../../../core/blitzkit/tankCharacteristics';
import { useEquipment } from '../../../../../hooks/useEquipment';
import { useTankModelDefinition } from '../../../../../hooks/useTankModelDefinition';
import { Duel } from '../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../stores/tankopediaEphemeral';
import type { MaybeSkeletonComponentProps } from '../../../../../types/maybeSkeletonComponentProps';
import { Crew } from './components/Crew';
import { Firepower } from './components/Firepower';
import { Maneuverability } from './components/Maneuverability';
import { Survivability } from './components/Survivability';

const [equipmentDefinitions, provisionDefinitions] = await Promise.all([
  awaitableEquipmentDefinitions,
  awaitableProvisionDefinitions,
]);

export function Characteristics({ skeleton }: MaybeSkeletonComponentProps) {
  const mutateDuel = Duel.useMutation();
  const crewSkills = TankopediaEphemeral.use((state) => state.skills);
  const provisions = Duel.use((state) => state.protagonist.provisions);
  const consumables = Duel.use((state) => state.protagonist.consumables);
  const camouflage = Duel.use((state) => state.protagonist.camouflage);
  const assaultDistance = Duel.use(
    (state) => state.protagonist.assaultDistance,
  );
  const equipmentMatrix = Duel.use(
    (state) => state.protagonist.equipmentMatrix,
  );
  const { tank, turret, gun, engine, track, shell } = Duel.use(
    (state) => state.protagonist,
  );
  const stockEngine = tank.engines[0];
  const stockTrack = tank.tracks[0];
  const stockTurret = tank.turrets[0];
  const stockGun = stockTurret.guns[0];
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[gun.gun_type!.value.base.id];
  const stats = tankCharacteristics(
    {
      tank,
      camouflage,
      consumables,
      crewSkills,
      engine,
      equipmentMatrix,
      gun,
      provisions,
      shell,
      turret,
      track,
      stockEngine,
      stockGun,
      stockTrack,
      stockTurret,
      applyReactiveArmor: false,
      applyDynamicArmor: false,
      applySpallLiner: false,
      assaultDistance,
    },
    {
      tankModelDefinition,
      equipmentDefinitions: equipmentDefinitions,
      provisionDefinitions: provisionDefinitions,
    },
  );

  const hasImprovedVerticalStabilizer = useEquipment(122);
  const hasDownImprovedVerticalStabilizer = useEquipment(124);

  useEffect(() => {
    mutateDuel((draft) => {
      [draft.protagonist.pitch, draft.protagonist.yaw] = applyPitchYawLimits(
        draft.protagonist.pitch,
        draft.protagonist.yaw,
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
        hasImprovedVerticalStabilizer,
        hasDownImprovedVerticalStabilizer,
      );
    });
  }, [hasImprovedVerticalStabilizer, hasDownImprovedVerticalStabilizer]);

  return (
    <Flex
      gap="8"
      direction={{ initial: 'column', md: 'row' }}
      align={{ initial: 'center', sm: 'start' }}
      width={{ initial: '100%', sm: 'auto' }}
    >
      <Firepower skeleton={skeleton} stats={stats} />

      <Flex
        gap="8"
        direction={{ initial: 'column', lg: 'row' }}
        align={{ initial: 'center', sm: 'start' }}
        width={{ initial: '100%', sm: 'auto' }}
      >
        <Maneuverability stats={stats} />

        <Flex
          gap="8"
          direction="column"
          align={{ initial: 'center', sm: 'start' }}
          width={{ initial: '100%', sm: 'auto' }}
        >
          <Survivability stats={stats} />
          <Crew stats={stats} />
        </Flex>
      </Flex>
    </Flex>
  );
}
