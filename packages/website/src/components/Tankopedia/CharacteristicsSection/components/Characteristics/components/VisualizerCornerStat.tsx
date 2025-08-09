import { Code, Flex, Text } from '@radix-ui/themes';

interface Props {
  label: string;
  value: string;
  side: `${'top' | 'bottom'}-${'left' | 'right'}`;
}

export function VisualizerCornerStat({ label, value, side }: Props) {
  return (
    <Flex
      gap="2"
      position="absolute"
      top={side === 'top-left' || side === 'top-right' ? '3' : undefined}
      bottom={
        side === 'bottom-left' || side === 'bottom-right' ? '3' : undefined
      }
      left={side === 'top-left' || side === 'bottom-left' ? '3' : undefined}
      right={side === 'top-right' || side === 'bottom-right' ? '3' : undefined}
    >
      <Text color="gray" size="1">
        {label}
      </Text>
      <Code size="1" variant="ghost">
        {value}
      </Code>
    </Flex>
  );
}
