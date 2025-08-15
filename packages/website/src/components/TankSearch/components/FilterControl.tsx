import {
  asset,
  ShellType,
  TANK_CLASSES,
  TankType,
  TIER_ROMAN_NUMERALS,
} from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import {
  Box,
  Flex,
  IconButton,
  Inset,
  Link,
  Popover,
  Text,
} from '@radix-ui/themes';
import { isEqual, times } from 'lodash-es';
import { awaitableGameDefinitions } from '../../../core/awaitables/gameDefinitions';
import { Var } from '../../../core/radix/var';
import { useLocale } from '../../../hooks/useLocale';
import {
  $tankFilters,
  initialTankFilters,
  type TankFilters,
} from '../../../stores/tankFilters';
import {
  $tankopediaSort,
  initialTankopediaSort,
} from '../../../stores/tankopediaSort';
import { classIcons } from '../../ClassIcon';
import { ExperimentIcon } from '../../ExperimentIcon';
import { GunAutoloaderIcon } from '../../GunAutoloaderIcon';
import { GunAutoreloaderIcon } from '../../GunAutoreloaderIcon';
import { GunRegularIcon } from '../../GunRegularIcon';
import { MissingShellIcon } from '../../MissingShellIcon';
import { ResearchedIcon } from '../../ResearchedIcon';
import { ScienceIcon } from '../../ScienceIcon';
import { ScienceOffIcon } from '../../ScienceOffIcon';

interface FilterControlProps {
  compact?: boolean;
}

const gameDefinitions = await awaitableGameDefinitions;

const shellTypeIcons: Record<ShellType, string> = {
  [ShellType.AP]: 'ap',
  [ShellType.APCR]: 'ap_cr',
  [ShellType.HE]: 'he',
  [ShellType.HEAT]: 'hc',
};

function ShellFilter({ index, premium }: { index: number; premium?: boolean }) {
  const tankFilters = useStore($tankFilters);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton variant="soft" radius="none" color="gray" highContrast>
          {tankFilters.shells[index] === null && (
            <Text color="gray" style={{ display: 'contents' }}>
              <MissingShellIcon width="1em" height="1em" />
            </Text>
          )}
          {tankFilters.shells[index] !== null && (
            <img
              style={{ width: '1em', height: '1em' }}
              src={asset(
                `icons/shells/${shellTypeIcons[tankFilters.shells[index]]}${premium ? '_premium' : ''}.webp`,
              )}
            />
          )}
        </IconButton>
      </Popover.Trigger>

      <Popover.Content>
        <Inset>
          <Flex>
            {Object.values(ShellType).map((shellType) => {
              if (typeof shellType === 'string') return null;

              const selected = tankFilters.shells[index] === shellType;

              return (
                <IconButton
                  key={shellType}
                  value={`${shellType}`}
                  radius="none"
                  variant={selected ? 'solid' : 'soft'}
                  onClick={() => {
                    const mutated = [
                      tankFilters.shells[0],
                      tankFilters.shells[1],
                      tankFilters.shells[2],
                    ] as TankFilters['shells'];

                    mutated[index] = selected ? null : shellType;

                    $tankFilters.setKey('shells', mutated);
                  }}
                  highContrast={selected}
                  color={selected ? undefined : 'gray'}
                >
                  <img
                    src={asset(
                      `icons/shells/${shellTypeIcons[shellType]}${premium ? '_premium' : ''}.webp`,
                    )}
                    style={{ width: '1em', height: '1em' }}
                  />
                </IconButton>
              );
            })}
          </Flex>
        </Inset>
      </Popover.Content>
    </Popover.Root>
  );
}

export function FilterControl({ compact }: FilterControlProps) {
  const tankFilters = useStore($tankFilters);
  const { strings } = useLocale();
  const clearable = !isEqual(tankFilters, initialTankFilters);

  return (
    <Flex direction="column" align="center">
      <Flex
        height="fit-content"
        gap="2"
        align={{ initial: 'start', md: 'center' }}
        justify="center"
      >
        <Flex
          flexShrink="0"
          direction={compact ? 'row' : { initial: 'row', md: 'column' }}
          overflow="hidden"
          style={{ borderRadius: 'var(--radius-5)' }}
        >
          <Flex
            direction={compact ? 'column' : { md: 'row', initial: 'column' }}
          >
            {times(5, (index) => {
              const tier = index + 1;
              const selected = tankFilters.tiers?.includes(tier);

              return (
                <IconButton
                  key={tier}
                  variant={selected ? 'solid' : 'soft'}
                  radius="none"
                  color={selected ? undefined : 'gray'}
                  highContrast
                  onClick={() => {
                    if (tankFilters.tiers.includes(tier)) {
                      $tankFilters.setKey(
                        'tiers',
                        tankFilters.tiers.filter((t) => t !== tier),
                      );
                    } else {
                      $tankFilters.setKey('tiers', [
                        ...tankFilters.tiers,
                        tier,
                      ]);
                    }
                  }}
                >
                  <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
                </IconButton>
              );
            })}
          </Flex>

          <Box
            display={{ initial: 'none', md: 'block' }}
            style={{
              height: Var('space-1'),
              backgroundColor: Var('gray-a3'),
            }}
          />

          <Flex
            direction={compact ? 'column' : { md: 'row', initial: 'column' }}
          >
            {times(5, (index) => {
              const tier = index + 6;
              const selected = tankFilters.tiers?.includes(tier);

              return (
                <IconButton
                  key={tier}
                  variant={selected ? 'solid' : 'soft'}
                  radius="none"
                  color={selected ? undefined : 'gray'}
                  highContrast
                  onClick={() => {
                    if (tankFilters.tiers.includes(tier)) {
                      $tankFilters.setKey(
                        'tiers',
                        tankFilters.tiers.filter((t) => t !== tier),
                      );
                    } else {
                      $tankFilters.setKey('tiers', [
                        ...tankFilters.tiers,
                        tier,
                      ]);
                    }
                  }}
                >
                  <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
                </IconButton>
              );
            })}
          </Flex>
        </Flex>

        <Flex
          flexShrink="0"
          direction={compact ? 'row' : { initial: 'row', md: 'column' }}
          overflow="hidden"
          style={{ borderRadius: 'var(--radius-5)' }}
        >
          <Flex
            direction={compact ? 'column' : { md: 'row', initial: 'column' }}
          >
            {gameDefinitions.nations
              .slice(0, Math.ceil(gameDefinitions.nations.length / 2))
              .map((nation) => {
                const selected = tankFilters.nations?.includes(nation);

                return (
                  <IconButton
                    key={nation}
                    variant={selected ? 'solid' : 'soft'}
                    color={selected ? undefined : 'gray'}
                    highContrast
                    radius="none"
                    onClick={() => {
                      if (tankFilters.nations.includes(nation)) {
                        $tankFilters.setKey(
                          'nations',
                          tankFilters.nations.filter((n) => n !== nation),
                        );
                      } else {
                        $tankFilters.setKey('nations', [
                          ...tankFilters.nations,
                          nation,
                        ]);
                      }
                    }}
                  >
                    <img
                      style={{ width: '1em', height: '1em' }}
                      src={asset(`flags/circle/${nation}.webp`)}
                    />
                  </IconButton>
                );
              })}
          </Flex>

          <Box
            display={{ initial: 'none', md: 'block' }}
            style={{
              height: Var('space-1'),
              backgroundColor: Var('gray-a3'),
            }}
          />

          <Flex
            direction={compact ? 'column' : { md: 'row', initial: 'column' }}
          >
            {gameDefinitions.nations
              .slice(Math.ceil(gameDefinitions.nations.length / 2))
              .map((nation) => {
                const selected = tankFilters.nations?.includes(nation);

                return (
                  <IconButton
                    key={nation}
                    style={{ flex: 1 }}
                    variant={selected ? 'solid' : 'soft'}
                    color={selected ? undefined : 'gray'}
                    highContrast
                    radius="none"
                    onClick={() => {
                      if (tankFilters.nations.includes(nation)) {
                        $tankFilters.setKey(
                          'nations',
                          tankFilters.nations.filter((n) => n !== nation),
                        );
                      } else {
                        $tankFilters.setKey('nations', [
                          ...tankFilters.nations,
                          nation,
                        ]);
                      }
                    }}
                  >
                    <img
                      style={{ width: '1em', height: '1em' }}
                      src={asset(`flags/circle/${nation}.webp`)}
                    />
                  </IconButton>
                );
              })}
          </Flex>
        </Flex>

        <Flex
          direction={{ initial: 'row', md: 'column' }}
          align="start"
          gap={{ initial: '2', md: '1' }}
        >
          <Flex gap="2" align="start">
            <Flex
              overflow="hidden"
              style={{ borderRadius: 'var(--radius-full)' }}
              direction={compact ? 'column' : { md: 'row', initial: 'column' }}
            >
              {TANK_CLASSES.map((tankClass) => {
                const Icon = classIcons[tankClass];
                const selected = tankFilters.classes?.includes(tankClass);

                return (
                  <IconButton
                    key={tankClass}
                    variant={selected ? 'solid' : 'soft'}
                    radius="none"
                    color={selected ? undefined : 'gray'}
                    highContrast
                    onClick={() => {
                      if (tankFilters.classes.includes(tankClass)) {
                        $tankFilters.setKey(
                          'classes',
                          tankFilters.classes.filter((c) => c !== tankClass),
                        );
                      } else {
                        $tankFilters.setKey('classes', [
                          ...tankFilters.classes,
                          tankClass,
                        ]);
                      }
                    }}
                  >
                    <Icon style={{ width: '1em', height: '1em' }} />
                  </IconButton>
                );
              })}
            </Flex>

            <Flex
              overflow="hidden"
              style={{ borderRadius: 'var(--radius-full)' }}
              direction={compact ? 'column' : { md: 'row', initial: 'column' }}
            >
              <IconButton
                variant={
                  tankFilters.gunType.includes('regular') ? 'solid' : 'soft'
                }
                radius="none"
                color={
                  tankFilters.gunType.includes('regular') ? undefined : 'gray'
                }
                highContrast
                onClick={() => {
                  if (tankFilters.gunType.includes('regular')) {
                    $tankFilters.setKey(
                      'gunType',
                      tankFilters.gunType.filter((t) => t !== 'regular'),
                    );
                  } else {
                    $tankFilters.setKey('gunType', [
                      ...tankFilters.gunType,
                      'regular',
                    ]);
                  }
                }}
              >
                <GunRegularIcon style={{ width: '1em', height: '1em' }} />
              </IconButton>
              <IconButton
                variant={
                  tankFilters.gunType.includes('auto_loader') ? 'solid' : 'soft'
                }
                radius="none"
                color={
                  tankFilters.gunType.includes('auto_loader')
                    ? undefined
                    : 'gray'
                }
                highContrast
                onClick={() => {
                  if (tankFilters.gunType.includes('auto_loader')) {
                    $tankFilters.setKey(
                      'gunType',
                      tankFilters.gunType.filter((t) => t !== 'auto_loader'),
                    );
                  } else {
                    $tankFilters.setKey('gunType', [
                      ...tankFilters.gunType,
                      'auto_loader',
                    ]);
                  }
                }}
              >
                <GunAutoloaderIcon style={{ width: '1em', height: '1em' }} />
              </IconButton>
              <IconButton
                variant={
                  tankFilters.gunType.includes('auto_reloader')
                    ? 'solid'
                    : 'soft'
                }
                radius="none"
                color={
                  tankFilters.gunType.includes('auto_reloader')
                    ? undefined
                    : 'gray'
                }
                highContrast
                onClick={() => {
                  if (tankFilters.gunType.includes('auto_reloader')) {
                    $tankFilters.setKey(
                      'gunType',
                      tankFilters.gunType.filter((t) => t !== 'auto_reloader'),
                    );
                  } else {
                    $tankFilters.setKey('gunType', [
                      ...tankFilters.gunType,
                      'auto_reloader',
                    ]);
                  }
                }}
              >
                <GunAutoreloaderIcon style={{ width: '1em', height: '1em' }} />
              </IconButton>
            </Flex>

            <Flex
              overflow="hidden"
              style={{ borderRadius: 'var(--radius-full)' }}
              direction={compact ? 'column' : { md: 'row', initial: 'column' }}
            >
              <ShellFilter index={0} />
              <ShellFilter index={1} premium />
              <ShellFilter index={2} />
            </Flex>
          </Flex>

          <Flex gap="2" align="start">
            <Flex
              overflow="hidden"
              style={{ borderRadius: 'var(--radius-full)' }}
              direction={compact ? 'column' : { md: 'row', initial: 'column' }}
            >
              <IconButton
                variant={
                  tankFilters.types?.includes(TankType.RESEARCHABLE)
                    ? 'solid'
                    : 'soft'
                }
                radius="none"
                color={
                  tankFilters.types?.includes(TankType.RESEARCHABLE)
                    ? undefined
                    : 'gray'
                }
                highContrast
                onClick={() => {
                  if (tankFilters.types.includes(TankType.RESEARCHABLE)) {
                    $tankFilters.setKey(
                      'types',
                      tankFilters.types.filter(
                        (t) => t !== TankType.RESEARCHABLE,
                      ),
                    );
                  } else {
                    $tankFilters.setKey('types', [
                      ...tankFilters.types,
                      TankType.RESEARCHABLE,
                    ]);
                  }
                }}
              >
                <ResearchedIcon style={{ width: '1em', height: '1em' }} />
              </IconButton>
              <IconButton
                variant={
                  tankFilters.types?.includes(TankType.PREMIUM)
                    ? 'solid'
                    : 'soft'
                }
                radius="none"
                color={
                  tankFilters.types?.includes(TankType.PREMIUM)
                    ? 'amber'
                    : 'gray'
                }
                highContrast
                onClick={() => {
                  if (tankFilters.types.includes(TankType.PREMIUM)) {
                    $tankFilters.setKey(
                      'types',
                      tankFilters.types.filter((t) => t !== TankType.PREMIUM),
                    );
                  } else {
                    $tankFilters.setKey('types', [
                      ...tankFilters.types,
                      TankType.PREMIUM,
                    ]);
                  }
                }}
              >
                <Text
                  color={
                    tankFilters.types?.includes(TankType.PREMIUM)
                      ? undefined
                      : 'amber'
                  }
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <ResearchedIcon style={{ width: '1em', height: '1em' }} />
                </Text>
              </IconButton>
              <IconButton
                variant={
                  tankFilters.types?.includes(TankType.COLLECTOR)
                    ? 'solid'
                    : 'soft'
                }
                radius="none"
                color={
                  tankFilters.types?.includes(TankType.COLLECTOR)
                    ? 'blue'
                    : 'gray'
                }
                highContrast
                onClick={() => {
                  if (tankFilters.types.includes(TankType.COLLECTOR)) {
                    $tankFilters.setKey(
                      'types',
                      tankFilters.types.filter((t) => t !== TankType.COLLECTOR),
                    );
                  } else {
                    $tankFilters.setKey('types', [
                      ...tankFilters.types,
                      TankType.COLLECTOR,
                    ]);
                  }
                }}
              >
                <Text
                  color={
                    tankFilters.types?.includes(TankType.COLLECTOR)
                      ? undefined
                      : 'blue'
                  }
                  style={{ display: 'flex', justifyContent: 'center' }}
                >
                  <ResearchedIcon style={{ width: '1em', height: '1em' }} />
                </Text>
              </IconButton>
            </Flex>

            <Flex
              overflow="hidden"
              style={{ borderRadius: 'var(--radius-full)' }}
              direction={compact ? 'column' : { md: 'row', initial: 'column' }}
            >
              <IconButton
                variant={tankFilters.testing === 'include' ? 'solid' : 'soft'}
                radius="none"
                color={tankFilters.testing === 'include' ? undefined : 'gray'}
                highContrast
                onClick={() => {
                  $tankFilters.setKey('testing', 'include');
                }}
              >
                <ExperimentIcon
                  style={{ width: '1em', height: '1em', color: 'currentColor' }}
                />
              </IconButton>
              <IconButton
                variant={tankFilters.testing === 'exclude' ? 'solid' : 'soft'}
                radius="none"
                color={tankFilters.testing === 'exclude' ? undefined : 'gray'}
                highContrast
                onClick={() => {
                  $tankFilters.setKey('testing', 'exclude');
                }}
              >
                <ScienceOffIcon
                  style={{ width: '1em', height: '1em', color: 'currentColor' }}
                />
              </IconButton>
              <IconButton
                variant={tankFilters.testing === 'only' ? 'solid' : 'soft'}
                radius="none"
                color={tankFilters.testing === 'only' ? undefined : 'gray'}
                highContrast
                onClick={() => {
                  $tankFilters.setKey('testing', 'only');
                }}
              >
                <ScienceIcon
                  style={{ width: '1em', height: '1em', color: 'currentColor' }}
                />
              </IconButton>
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      {clearable && (
        <Link
          color="red"
          underline="always"
          mt="4"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            $tankFilters.set(initialTankFilters);
            $tankopediaSort.set(initialTankopediaSort);
          }}
        >
          {strings.website.common.tank_search.clear_filters}
        </Link>
      )}
    </Flex>
  );
}
