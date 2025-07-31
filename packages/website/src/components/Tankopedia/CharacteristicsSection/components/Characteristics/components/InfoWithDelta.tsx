import { createDefaultSkills } from '@blitzkit/core';
import { Flex, Progress, Text } from '@radix-ui/themes';
import { clamp } from 'lodash-es';
import { useMemo, type ComponentProps, type ReactNode } from 'react';
import { awaitableEquipmentDefinitions } from '../../../../../../core/awaitables/equipmentDefinitions';
import { awaitableModelDefinitions } from '../../../../../../core/awaitables/modelDefinitions';
import { awaitableProvisionDefinitions } from '../../../../../../core/awaitables/provisionDefinitions';
import { awaitableSkillDefinitions } from '../../../../../../core/awaitables/skillDefinitions';
import { awaitableTankDefinitions } from '../../../../../../core/awaitables/tankDefinitions';
import {
  tankCharacteristics,
  type TankCharacteristics,
} from '../../../../../../core/blitzkit/tankCharacteristics';
import { tankToDuelMember } from '../../../../../../core/blitzkit/tankToDuelMember';
import { useDelta } from '../../../../../../hooks/useDelta';
import { useLocale } from '../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../stores/duel';
import {
  TankopediaEphemeral,
  TankopediaRelativeAgainst,
} from '../../../../../../stores/tankopediaEphemeral';
import { Info, type InfoProps } from './Info';

type InfoWithDeltaProps = Omit<InfoProps, 'name'> & {
  stats: TankCharacteristics;
  noRanking?: boolean;
} & (
    | {
        value: keyof TankCharacteristics;
      }
    | {
        value: (tank: TankCharacteristics) => number | undefined;
        name: ReactNode;
      }
  );

const [
  tankDefinitions,
  provisionDefinitions,
  equipmentDefinitions,
  modelDefinitions,
  skillDefinitions,
] = await Promise.all([
  awaitableTankDefinitions,
  awaitableProvisionDefinitions,
  awaitableEquipmentDefinitions,
  awaitableModelDefinitions,
  awaitableSkillDefinitions,
]);

export function InfoWithDelta({
  stats,
  indent,
  noRanking,
  deltaType,
  ...props
}: InfoWithDeltaProps) {
  const { strings } = useLocale();
  const relativeAgainst = TankopediaEphemeral.use(
    (state) => state.relativeAgainst,
  );
  const uhWhatDoICallThisVariable =
    typeof props.value === 'function'
      ? props.value(stats)!
      : (stats[props.value] as number);
  const delta = useDelta(uhWhatDoICallThisVariable);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const shellIndex = Duel.use((state) =>
    state.protagonist.gun.gun_type!.value.base.shells.indexOf(
      state.protagonist.shell,
    ),
  );
  const equipmentMatrix = Duel.use(
    (state) => state.protagonist.equipmentMatrix,
  );
  const others = useMemo(() => {
    const defaultSkills = createDefaultSkills(skillDefinitions);

    return Object.values(tankDefinitions.tanks)
      .filter(
        (tank) =>
          (relativeAgainst === TankopediaRelativeAgainst.Class &&
            tank.tier === protagonistTank.tier &&
            tank.class === protagonistTank.class) ||
          (relativeAgainst === TankopediaRelativeAgainst.Tier &&
            tank.tier === protagonistTank.tier) ||
          relativeAgainst === TankopediaRelativeAgainst.All,
      )
      .map((tank) => {
        const thisTankModel = modelDefinitions.models[tank.id];
        const member = tankToDuelMember(
          tank,
          thisTankModel,
          provisionDefinitions,
        );

        if (member.gun.gun_type!.value.base.shells[shellIndex] === undefined) {
          return undefined;
        }

        return tankCharacteristics(
          {
            applyDynamicArmor: false,
            applyReactiveArmor: false,
            applySpallLiner: false,
            camouflage: member.camouflage,
            consumables: member.consumables,
            crewSkills: defaultSkills,
            provisions: member.provisions,
            engine: member.engine,
            gun: member.gun,
            equipmentMatrix: equipmentMatrix,
            shell: member.gun.gun_type!.value.base.shells[shellIndex],
            stockEngine: tank.engines[0],
            stockGun: tank.turrets[0].guns[0],
            stockTrack: tank.tracks[0],
            stockTurret: tank.turrets[0],
            tank,
            track: member.track,
            turret: member.turret,
            assaultDistance: 0,
          },
          {
            equipmentDefinitions,
            provisionDefinitions,
            tankModelDefinition: modelDefinitions.models[tank.id],
          },
        );
      })
      .filter((tank) => {
        if (tank === undefined) return false;

        const othersValue =
          typeof props.value === 'function'
            ? props.value(tank)!
            : (tank[props.value] as number);

        return othersValue !== undefined;
      }) as TankCharacteristics[];
  }, [relativeAgainst, shellIndex, equipmentMatrix]);
  const betterTanks = others.filter((tank) => {
    const othersValue =
      typeof props.value === 'function'
        ? props.value(tank)!
        : (tank[props.value] as number);

    if (othersValue === undefined) return false;
    return deltaType === 'lowerIsBetter'
      ? othersValue < uhWhatDoICallThisVariable
      : othersValue > uhWhatDoICallThisVariable;
  });
  const goodness = (others.length - betterTanks.length) / others.length;
  let color: ComponentProps<typeof Progress>['color'];

  if (goodness <= 0.25) color = 'red';
  else if (goodness <= 0.5) color = 'orange';
  else if (goodness <= 0.75) color = 'yellow';
  else color = 'green';

  return (
    <Flex direction="column">
      <Info
        deltaType={deltaType}
        indent={indent}
        {...props}
        name={
          'name' in props
            ? props.name
            : strings.website.tools.tankopedia.characteristics.values[
                props.value
              ]
        }
        delta={delta}
      >
        {uhWhatDoICallThisVariable}
      </Info>

      {!noRanking && (
        <Flex pl={indent ? '2' : '0'} align="center" gap="2" mb="2">
          <Progress
            variant="soft"
            size="1"
            value={goodness * 100}
            color={color}
            style={{ height: '0.125rem', opacity: 0.5 }}
          />

          <Text color="gray" size="1">
            {clamp(betterTanks.length + 1, 1, others.length)} / {others.length}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
