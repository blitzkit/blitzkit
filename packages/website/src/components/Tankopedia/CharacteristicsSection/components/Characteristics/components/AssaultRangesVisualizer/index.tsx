import type { AssaultRanges } from '@blitzkit/core';
import { Box, Card, Flex, Text } from '@radix-ui/themes';
import { clamp } from 'three/src/math/MathUtils.js';
import { Var } from '../../../../../../../core/radix/var';

interface Props {
  ranges: AssaultRanges;
}

export function AssaultRangesVisualizer({ ranges }: Props) {
  return (
    <Card variant="classic" style={{ aspectRatio: '1 / 1' }}>
      <Flex
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        direction="column"
      >
        <Text m="3" size="2" color="gray">
          Assault shell damage
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
            <Box position="relative" width={Var('space-7')}>
              {ranges.ranges.map((range) => (
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
                  {Math.round(range.factor * 100)}%
                </Text>
              ))}
            </Box>

            <Flex flexGrow="1" align="end" position="relative">
              {ranges.ranges.map((range, index) => {
                const mix = clamp(1.5 * (range.factor - 1) + 1, 0, 1) * 100;
                const color0 = `color-mix(in hsl, ${Var('tomato-9')}, ${Var('jade-9')} ${mix}%)`;
                const color1 = `color-mix(in hsl, ${Var('tomato-7')}, ${Var('jade-7')} ${mix}%)`;

                return (
                  <Box
                    style={{
                      height: `${range.factor * 100}%`,
                      background: `linear-gradient(45deg, ${color1}, ${color0})`,
                    }}
                    flexGrow={`${range.distance}`}
                    key={index}
                  />
                );
              })}

              {ranges.ranges.map((range, index) => (
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

          <Flex ml="7" height={Var('space-7')}>
            {ranges.ranges.map((range, index) => (
              <Box
                position="relative"
                key={index}
                height="100%"
                flexGrow={`${range.distance}`}
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
                  {range.distance}m
                </Text>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
