import type { AssaultRanges } from '@blitzkit/core';
import { Box, Card, Flex, Inset, Text } from '@radix-ui/themes';
import { clamp } from 'three/src/math/MathUtils.js';
import { Var } from '../../../../../../../core/radix/var';

interface Props {
  ranges: AssaultRanges;
}

const ASSAULT_RANGE_BAR_HEIGHT = '8rem';

export function AssaultRangesVisualizer({ ranges }: Props) {
  return (
    <Card variant="classic">
      <Inset>
        <Flex pl="3" pt="4" direction="column" gap="5">
          <Text size="2" color="gray">
            Assault shell damage
          </Text>

          <Flex>
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
              {ranges.ranges.map((range, index) => (
                <>
                  <Box
                    style={{
                      height: `calc(${ASSAULT_RANGE_BAR_HEIGHT} * ${range.factor})`,
                      backgroundColor: `color-mix(in hsl, ${Var('tomato-9')}, ${Var('jade-9')} ${
                        clamp(
                          1.5 * (range.factor - 1) + 1,

                          0,
                          1,
                        ) * 100
                      }%)`,
                    }}
                    flexGrow={`${range.distance}`}
                    key={index}
                  />

                  <Box
                    position="absolute"
                    left="0"
                    bottom={`${range.factor * 100}%`}
                    width="100%"
                    height="0.5px"
                    style={{
                      transform: 'translateY(-50%)',
                      backgroundColor: Var('gray-12'),
                    }}
                  />
                </>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </Inset>
    </Card>
  );
}
