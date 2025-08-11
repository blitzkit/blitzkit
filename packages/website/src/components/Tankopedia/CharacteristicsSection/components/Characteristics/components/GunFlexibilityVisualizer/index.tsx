import { Box, Card, Flex } from '@radix-ui/themes';
import { Var } from '../../../../../../../core/radix/var';
import type { MaybeSkeletonComponentProps } from '../../../../../../../types/maybeSkeletonComponentProps';
import { FlexibilityCanvas } from './components/FlexibilityCanvas';
import { FlexibilityCard } from './components/FlexibilityCard';

export function GunFlexibilityVisualizer({
  skeleton,
}: MaybeSkeletonComponentProps) {
  return (
    <Flex direction="column-reverse" gap="0">
      <Box mt="-4" px="2">
        <Card variant="classic" style={{ height: '10rem' }}>
          <Box
            style={{ backgroundColor: Var('gray-1') }}
            position="absolute"
            width="100%"
            height="100%"
            top="0"
            left="0"
          >
            {!skeleton && <FlexibilityCanvas />}
          </Box>
        </Card>
      </Box>

      <FlexibilityCard />
    </Flex>
  );
}
