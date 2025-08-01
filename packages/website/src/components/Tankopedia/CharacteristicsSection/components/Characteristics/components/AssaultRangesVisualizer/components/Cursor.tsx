import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useState } from 'react';
import { Var } from '../../../../../../../../core/radix/var';

export function AssaultCursor() {
  const [x, setX] = useState(0.5);

  return (
    <Box
      position="absolute"
      top="0"
      left={`${x * 100}%`}
      height="100%"
      width="3pt"
      style={{
        transform: 'translateX(-50%)',
        backgroundColor: Var('accent-11'),
      }}
    >
      <Flex
        align="center"
        direction="column"
        position="absolute"
        left="50%"
        bottom="100%"
        style={{ transform: 'translateX(-50%)', cursor: 'grab' }}
      >
        <Flex
          align="center"
          justify="center"
          style={{
            width: '1.5rem',
            height: '1.5rem',
            backgroundColor: Var('accent-9'),
            borderRadius: `50% 50% ${Var('radius-1')} ${Var('radius-1')}`,
          }}
        >
          <Text style={{ display: 'flex' }} highContrast color="purple">
            <DragHandleDots2Icon />
          </Text>
        </Flex>

        <Box
          height="0.5rem"
          width="2px"
          style={{
            backgroundColor: Var('accent-9'),
          }}
        />
      </Flex>

      <Box
        position="absolute"
        left="50%"
        top="0"
        height="100%"
        width="1pt"
        style={{
          transform: 'translateX(-50%)',
          backgroundColor: Var('accent-9'),
        }}
      />
    </Box>
  );
}
