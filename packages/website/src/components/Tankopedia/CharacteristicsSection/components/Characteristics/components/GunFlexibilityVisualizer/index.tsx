import { Box, Flex } from '@radix-ui/themes';
import type { MaybeSkeletonComponentProps } from '../../../../../../../types/maybeSkeletonComponentProps';
import { FlexibilityCanvas } from './components/FlexibilityCanvas';
import { FlexibilityCard } from './components/FlexibilityCard';

export function GunFlexibilityVisualizer({
  skeleton,
}: MaybeSkeletonComponentProps) {
  return (
    <Flex direction="column" gap="4">
      <FlexibilityCard />

      <Box position="relative" style={{ aspectRatio: '2 / 1' }}>
        <Box position="absolute" width="100%" height="100%" top="0" left="0">
          {!skeleton && <FlexibilityCanvas />}
        </Box>

        <Box
          position="absolute"
          width="100%"
          height="100%"
          top="0"
          left="0"
          style={{
            boxShadow: 'inset 0 -1rem 1rem var(--gray-1)',
          }}
        />
      </Box>
    </Flex>
  );
}
