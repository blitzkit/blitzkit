import { Box, Flex } from '@radix-ui/themes';
import type { QuicklimeCallback } from 'quicklime';
import { useEffect, useRef } from 'react';
import { reloadUpdate, type ReloadUpdateData } from '..';
import { Var } from '../../../../../../../../core/radix/var';
import type { StatsAcceptorProps } from '../../TraverseVisualizer';
import { ShellBorder } from './ShellBorder';

interface ShellProps {
  index: number;
}

export function Shell({ index, stats }: ShellProps & StatsAcceptorProps) {
  const bar = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleReloadUpdate: QuicklimeCallback<ReloadUpdateData> = ({
      data,
    }) => {
      bar.current.style.width = `${data.shells[index] * 100}%`;
    };

    reloadUpdate.on(handleReloadUpdate);

    return () => {
      reloadUpdate.off(handleReloadUpdate);
    };
  }, []);

  return (
    <Box
      style={{
        width: '100%',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) rotate(${135 - 7 * (index - (stats.shells - 1) / 2)}deg)`,
      }}
    >
      <Box
        left="50%"
        position="absolute"
        ml="40%"
        width="1.25rem"
        height="1.25rem"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <ShellBorder
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            color: Var('jade-8'),
          }}
        />

        <Flex
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          justify="end"
          style={{
            borderRadius: '0.25rem',
            overflow: 'hidden',
            maskImage:
              'url(/assets/images/tankopedia/visualizers/reload/shell.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        >
          <Box
            ref={bar}
            style={{
              width: '100%',
              background: Var('jade-9'),
            }}
          />
        </Flex>
      </Box>
    </Box>
  );
}
