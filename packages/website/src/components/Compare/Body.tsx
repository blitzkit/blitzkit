import { asset } from '@blitzkit/core';
import { Flex, Heading, IconButton, Table } from '@radix-ui/themes';
import type { TankCharacteristics } from '../../core/blitzkit/tankCharacteristics';
import { useLocale } from '../../hooks/useLocale';
import { CompareEphemeral } from '../../stores/compareEphemeral';
import { StickyColumnHeaderCell } from '../StickyColumnHeaderCell';
import { CompareRow } from './CompareRow';
import { CompareSectionTitle } from './CompareSectionTitle';

interface BodyProps {
  stats: TankCharacteristics[];
}

export function Body({ stats }: BodyProps) {
  const members = CompareEphemeral.use((state) => state.members);
  const hasNonRegularGun = members.some(
    ({ gun }) => gun.gun_type!.$case !== 'regular',
  );
  const { unwrap, strings } = useLocale();
  const mutateCompareEphemeral = CompareEphemeral.useMutation();

  return (
    <>
      <Table.Header>
        <Table.Row>
          <StickyColumnHeaderCell top={137} style={{ left: 0, zIndex: 2 }}>
            <Flex height="100%" align="center">
              <Heading size="4">Firepower</Heading>
            </Flex>
          </StickyColumnHeaderCell>

          {members.map(({ gun, shell, key }, index) => (
            <StickyColumnHeaderCell key={key} top={137}>
              <Flex justify="center">
                <Flex>
                  {gun.gun_type!.value.base.shells.map(
                    (thisShell, shellIndex) => (
                      <IconButton
                        color={thisShell.id === shell.id ? undefined : 'gray'}
                        variant="soft"
                        key={thisShell.id}
                        style={{
                          borderTopLeftRadius: shellIndex === 0 ? undefined : 0,
                          borderBottomLeftRadius:
                            shellIndex === 0 ? undefined : 0,
                          borderTopRightRadius:
                            shellIndex ===
                            gun.gun_type!.value.base.shells.length - 1
                              ? undefined
                              : 0,
                          borderBottomRightRadius:
                            shellIndex ===
                            gun.gun_type!.value.base.shells.length - 1
                              ? undefined
                              : 0,
                          marginLeft: shellIndex === 0 ? 0 : -1,
                        }}
                        onClick={() => {
                          mutateCompareEphemeral((draft) => {
                            draft.members[index].shell = thisShell;
                          });
                        }}
                      >
                        <img
                          alt={unwrap(thisShell.name)}
                          width={16}
                          height={16}
                          src={asset(`icons/shells/${thisShell.icon}.webp`)}
                        />
                      </IconButton>
                    ),
                  )}
                </Flex>
              </Flex>
            </StickyColumnHeaderCell>
          ))}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <CompareRow stats={stats} value="dpm" decimals={0} />
        <CompareRow stats={stats} value="damage" decimals={0} />
        {hasNonRegularGun && (
          <CompareRow stats={stats} indent value="clipDamage" decimals={0} />
        )}
        <CompareRow stats={stats} value="moduleDamage" decimals={0} />
        <CompareRow stats={stats} value="penetration" decimals={0} />
        <CompareRow
          stats={stats}
          name={strings.website.tools.tankopedia.characteristics.values.reload}
          deltaType="lowerIsBetter"
          value={(stats) =>
            stats.shellReload ??
            stats.shellReloads!.reduce((a, b) => a + b, 0) /
              stats.shellReloads!.length
          }
          display={(stats) =>
            stats.shellReload?.toFixed(2) ??
            stats.shellReloads!.map((reload) => reload.toFixed(2)).join(', ')
          }
          deltaNominalDisplay={(delta) => delta.toFixed(2)}
        />
        {hasNonRegularGun && (
          <>
            <CompareRow
              stats={stats}
              deltaType="lowerIsBetter"
              value="intraClip"
              decimals={2}
            />
            <CompareRow stats={stats} value="shells" decimals={0} />
          </>
        )}
        <CompareRow stats={stats} value="caliber" decimals={0} />
        <CompareRow stats={stats} value="shellNormalization" decimals={0} />
        <CompareRow
          stats={stats}
          value="shellRicochet"
          deltaType="lowerIsBetter"
          decimals={0}
        />
        <CompareRow stats={stats} value="shellVelocity" decimals={0} />
        <CompareRow stats={stats} value="shellRange" decimals={0} />
        <CompareRow stats={stats} value="shellCapacity" decimals={0} />
        <CompareRow
          stats={stats}
          value="aimTime"
          deltaType="lowerIsBetter"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          value="dispersion"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          indent
          value="dispersionMoving"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          indent
          value="dispersionHullTraversing"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          indent
          value="dispersionTurretTraversing"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          indent
          value="dispersionShooting"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow
          stats={stats}
          indent
          value="dispersionGunDamaged"
          deltaType="lowerIsBetter"
          decimals={3}
        />
        <CompareRow stats={stats} value="gunDepression" decimals={1} />
        <CompareRow stats={stats} indent value="gunElevation" decimals={1} />
      </Table.Body>

      <CompareSectionTitle>Maneuverability</CompareSectionTitle>
      <Table.Body>
        <CompareRow stats={stats} value="speedForwards" decimals={0} />
        <CompareRow stats={stats} indent value="speedBackwards" decimals={0} />
        <CompareRow stats={stats} value="enginePower" decimals={0} />
        <CompareRow stats={stats} value="weight" decimals={1} />
        <CompareRow stats={stats} value="hardTerrainCoefficient" decimals={0} />
        <CompareRow
          stats={stats}
          indent
          value="mediumTerrainCoefficient"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          indent
          value="softTerrainCoefficient"
          decimals={0}
        />
        <CompareRow
          stats={stats}
          value="hardTerrainCoefficientRaw"
          deltaType="lowerIsBetter"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          indent
          value="mediumTerrainCoefficientRaw"
          deltaType="lowerIsBetter"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          indent
          value="softTerrainCoefficientRaw"
          deltaType="lowerIsBetter"
          decimals={2}
        />
        <CompareRow
          stats={stats}
          value="powerToWeightRatioHardTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          indent
          value="powerToWeightRatioMediumTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          indent
          value="powerToWeightRatioSoftTerrain"
          decimals={1}
        />
        <CompareRow stats={stats} value="turretTraverseSpeed" decimals={1} />
        <CompareRow
          stats={stats}
          value="hullTraverseHardTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          indent
          value="hullTraverseMediumTerrain"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          indent
          value="hullTraverseSoftTerrain"
          decimals={1}
        />
      </Table.Body>

      <CompareSectionTitle>Survivability</CompareSectionTitle>
      <Table.Body>
        <CompareRow stats={stats} value="health" decimals={0} />
        <CompareRow
          stats={stats}
          value="fireChance"
          deltaType="lowerIsBetter"
          display={(stats) => (stats.fireChance * 100).toFixed(0)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(0)}
        />
        <CompareRow stats={stats} value="viewRange" decimals={0} />
        <CompareRow
          stats={stats}
          value="camouflageStill"
          display={(stats) => (stats.camouflageStill * 100).toFixed(2)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(2)}
        />
        <CompareRow
          stats={stats}
          indent
          value="camouflageMoving"
          display={(stats) => (stats.camouflageMoving * 100).toFixed(2)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(2)}
        />
        <CompareRow
          stats={stats}
          indent
          value="camouflageShootingStill"
          display={(stats) => (stats.camouflageShootingStill * 100).toFixed(2)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(2)}
        />
        <CompareRow
          stats={stats}
          indent
          value="camouflageShootingMoving"
          display={(stats) => (stats.camouflageShootingMoving * 100).toFixed(2)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(2)}
        />
        <CompareRow
          stats={stats}
          indent
          value="camouflageCaughtOnFire"
          display={(stats) => (stats.camouflageCaughtOnFire * 100).toFixed(2)}
          deltaNominalDisplay={(delta) => (delta * 100).toFixed(2)}
        />
        <CompareRow
          stats={stats}
          value="volume"
          deltaType="lowerIsBetter"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          indent
          value="width"
          deltaType="lowerIsBetter"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          indent
          value="height"
          deltaType="lowerIsBetter"
          decimals={1}
        />
        <CompareRow
          stats={stats}
          indent
          value="length"
          deltaType="lowerIsBetter"
          decimals={1}
        />
      </Table.Body>
    </>
  );
}
