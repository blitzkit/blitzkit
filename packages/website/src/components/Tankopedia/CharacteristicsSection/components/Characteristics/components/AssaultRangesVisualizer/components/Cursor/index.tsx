import { DragHandleDots2Icon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useEffect, useRef, useState } from 'react';
import { clamp } from 'three/src/math/MathUtils.js';
import {
  fakeLogSquishyHigh,
  fakeLogSquishyHighInverse,
} from '../../../../../../../../../core/blitzkit/fakeLog';
import { Var } from '../../../../../../../../../core/radix/var';
import { Duel } from '../../../../../../../../../stores/duel';
import './index.css';

interface Props {
  maxDistance: number;
  maxFakeDistance: number;
}

export function AssaultCursor({ maxDistance, maxFakeDistance }: Props) {
  const assaultDistance = Duel.use(
    (state) => state.protagonist.assaultDistance,
  );
  const [x, setX] = useState(fakeLogSquishyHigh(assaultDistance / maxDistance));
  const cursor = useRef<HTMLDivElement>(null);
  const mutateDuel = Duel.useMutation();

  useEffect(() => {
    let localX = x;
    let lastX = 0;

    function handlePointerDown(event: PointerEvent) {
      event.preventDefault();

      lastX = event.clientX;

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      const parent = cursor.current?.parentElement;

      if (!parent) return;

      const width = parent.clientWidth;
      const movementX = event.clientX - lastX;
      lastX = event.clientX;

      setX((state) => {
        localX = clamp(state + movementX / width, 0, 1);
        return localX;
      });
    }

    function handlePointerUp() {
      mutateDuel((draft) => {
        draft.protagonist.assaultDistance =
          fakeLogSquishyHighInverse(localX * maxFakeDistance) * maxDistance;
      });

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }

    cursor.current?.addEventListener('pointerdown', handlePointerDown);

    return () => {
      cursor.current?.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <Box
      ref={cursor}
      position="absolute"
      top="0"
      left={`${x * 100}%`}
      height="100%"
      width="2pt"
      id="assault-cursor"
      style={{
        touchAction: 'none',
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
        style={{ transform: 'translateX(-50%)' }}
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
          width="2pt"
          style={{
            backgroundColor: Var('accent-11'),
          }}
        />
      </Flex>
    </Box>
  );
}
