import type { AssaultRanges } from '@blitzkit/core';
import { literals } from '@blitzkit/i18n';
import { Box, Card, Flex, Text } from '@radix-ui/themes';
import { clamp } from 'three/src/math/MathUtils.js';
import type { TankCharacteristics } from '../../../../../../../core/blitzkit/tankCharacteristics';
import { Var } from '../../../../../../../core/radix/var';
import { useLocale } from '../../../../../../../hooks/useLocale';

interface Props {
  ranges: AssaultRanges;
  stats: TankCharacteristics;
}

export function AssaultRangesVisualizer({ ranges: _ranges, stats }: Props) {
  const maxDistance = Math.max(
    ..._ranges.ranges.map((range) => range.distance),
  );
  const ranges = _ranges.ranges.map((range) => ({
    factor: range.factor,
    distance: range.distance,
    fakeDistance: (2 / Math.PI) * Math.atan((4 * range.distance) / maxDistance),
  }));
  const sumFakeDistances = ranges.reduce(
    (total, range) => total + range.fakeDistance,
    0,
  );
  const { strings } = useLocale();

  return (
    <Card mb="6" variant="classic" style={{ aspectRatio: '1 / 1' }}>
      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        direction="column"
      >
        <Text m="3" size="2" color="gray">
          {strings.website.tools.tankopedia.visualizers.assault.title}
        </Text>

        <Flex
          direction="column"
          p="3"
          pt="5"
          pr="5"
          style={{ backgroundColor: Var('gray-1') }}
          flexGrow="1"
        >
          <Flex flexGrow="1">
            <Box position="relative" width={Var('space-8')}>
              {ranges.map((range) => (
                <Text
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: `${(1 - range.factor) * 100}%`,
                    transform: 'translateY(-50%)',
                  }}
                  color="gray"
                  size="1"
                  wrap="nowrap"
                >
                  {literals(strings.common.units.hp, [
                    `${Math.round(stats.damageWithoutAssault * range.factor)}`,
                  ])}
                </Text>
              ))}
            </Box>

            <Flex flexGrow="1" align="end" position="relative">
              {ranges.map((range, index) => {
                const mix = clamp(1.5 * (range.factor - 1) + 1, 0, 1) * 100;
                const color0 = `color-mix(in hsl, ${Var('tomato-9')}, ${Var('jade-9')} ${mix}%)`;
                const color1 = `color-mix(in hsl, ${Var('tomato-7')}, ${Var('jade-7')} ${mix}%)`;

                return (
                  <Box
                    width={`${(range.fakeDistance / sumFakeDistances) * 100}%`}
                    height={`${range.factor * 100}%`}
                    style={{
                      background: `linear-gradient(45deg, ${color1}, ${color0})`,
                    }}
                    key={index}
                  />
                );
              })}

              {ranges.map((range, index) => (
                <Box
                  key={index}
                  position="absolute"
                  left="0"
                  bottom={`${range.factor * 100}%`}
                  width="100%"
                  height="1pt"
                  style={{
                    transform: 'translateY(50%)',
                    backgroundColor: Var('gray-11'),
                  }}
                />
              ))}
            </Flex>
          </Flex>

          <Flex ml="8" height={Var('space-7')}>
            {ranges.map((range, index) => (
              <Box
                position="relative"
                key={index}
                width={`${(range.fakeDistance / sumFakeDistances) * 100}%`}
                height="100%"
              >
                <Text
                  size="1"
                  color="gray"
                  mt="2"
                  style={{
                    position: 'absolute',
                    right: 0,
                    transform: 'translateX(50%)',
                    writingMode: 'vertical-rl',
                  }}
                >
                  {literals(strings.common.units.m, [
                    `${Math.round(range.distance)}`,
                  ])}
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
