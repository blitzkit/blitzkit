import { Box, Code } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Quicklime, type QuicklimeCallback } from 'quicklime';
import { useCallback, useEffect, useRef } from 'react';
import { Var } from '../../../../../../../core/radix/var';
import type { StatsAcceptorProps } from '../TraverseVisualizer';
import { VisualizerCard } from '../VisualizerCard';
import { Shell } from './components/Shell';
import { Target } from './components/Target';
import './index.css';

const PRECISION = 2;

export interface ReloadUpdateData {
  reload: number;
  shells: number[];
}

export const reloadUpdate = new Quicklime<ReloadUpdateData>();

export function ReloadVisualizer({ stats }: StatsAcceptorProps) {
  const reloadCircle = useRef<HTMLDivElement>(null);
  const reloadCore = useRef<HTMLDivElement>(null);
  const reloadGlow = useRef<HTMLDivElement>(null);
  const totalTime = useRef<HTMLSpanElement>(null);
  const progressTime = useRef<HTMLSpanElement>(null);

  const state = useRef(0);

  const shoot = useCallback(() => {
    const element = document.getElementById('reload-visualizer-flash');

    console.log('shoot');

    element?.classList.add('go');
    void element?.offsetWidth;
    element?.classList.remove('go');
  }, []);

  useEffect(() => {
    let cancel = false;
    let lastT = Date.now() / 1000;
    let lastState = state.current;
    const shellArray = new Array(stats.shells);

    function frame() {
      if (!totalTime.current || !progressTime.current) return;

      const reloadThreshold = stats.shellReloads
        ? stats.shellReloads.length
        : 1;
      const now = Date.now() / 1000;
      const dt = now - lastT;
      let reload;
      let shells;

      if (state.current < reloadThreshold) {
        const shellReload =
          reloadThreshold === 1
            ? stats.shellReload!
            : stats.shellReloads![Math.floor(state.current)];

        state.current = Math.min(
          reloadThreshold,
          state.current + dt / shellReload,
        );
        reload = state.current % 1;
        shells = shellArray.fill(reload);

        if (reloadThreshold > 1) {
          shells = shells.map((_, index) =>
            Math.max(0, state.current - shellArray.length + index + 1),
          );
        }

        totalTime.current.innerHTML = shellReload.toFixed(PRECISION);
        progressTime.current.innerHTML = ((1 - reload) * shellReload).toFixed(
          PRECISION,
        );

        if (state.current >= reloadThreshold) shoot();
      } else if (state.current < stats.shells + reloadThreshold - 1) {
        let interval;

        if (
          stats.burstShells === 1 ||
          Math.floor(state.current) % stats.burstShells === 0
        ) {
          interval = stats.intraClip!;
        } else {
          interval = stats.burstInterShell!;
        }

        state.current = Math.min(
          stats.shells + reloadThreshold,
          state.current + dt / interval,
        );
        reload = state.current % 1;

        if (reloadThreshold > 1) {
          shells = shellArray.map((_, index) =>
            Math.max(
              0,
              Math.floor(index + 1 + reloadThreshold - state.current),
            ),
          );
        } else {
          shells = times(stats.shells, (index) => index > state.current - 1);
        }

        totalTime.current.innerHTML = interval.toFixed(PRECISION);
        progressTime.current.innerHTML = ((1 - reload) * interval).toFixed(
          PRECISION,
        );

        if (lastState % 1 > state.current % 1) shoot();
      } else {
        state.current = 0;
        reload = 0;
        shells = shellArray.fill(0);
      }

      reloadUpdate.dispatch({ reload, shells });

      if (!cancel) requestAnimationFrame(frame);

      lastT = now;
      lastState = state.current;
    }

    frame();

    return () => {
      cancel = true;
    };
  }, [stats]);

  useEffect(() => {
    const handleReloadUpdate: QuicklimeCallback<ReloadUpdateData> = ({
      data,
    }) => {
      if (!reloadCircle.current || !reloadCore.current || !reloadGlow.current)
        return;

      const reloadAngle = data.reload * 2 * Math.PI;

      reloadCircle.current.style.background = `conic-gradient(${Var('amber-9')} 0 ${reloadAngle}rad, ${Var('orange-7')} ${reloadAngle}rad)`;
      reloadCore.current.style.background = `conic-gradient(${Var('amber-6')} 0 ${reloadAngle}rad, ${Var('orange-3')} ${reloadAngle}rad)`;
      reloadGlow.current.style.background = `conic-gradient(${Var('amber-9')} 0 ${reloadAngle}rad, transparent ${reloadAngle}rad)`;
    };

    reloadUpdate.on(handleReloadUpdate);

    return () => {
      reloadUpdate.off(handleReloadUpdate);
    };
  }, []);

  return (
    <VisualizerCard>
      <Box position="absolute" top="0" left="0" width="100%" height="100%">
        <Target />

        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          style={{
            background: `radial-gradient(transparent 50%, ${Var('black-a8')} 100%)`,
          }}
        />
      </Box>

      <Box
        p="1"
        position="absolute"
        top="50%"
        left="50%"
        width="65%"
        height="65%"
        className="reload"
        ref={reloadGlow}
        style={{
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          filter: 'blur(0.5rem)',
        }}
      />

      <Box
        p="1"
        position="absolute"
        top="50%"
        left="50%"
        width="65%"
        height="65%"
        className="reload"
        ref={reloadCircle}
        style={{
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: Var('orange-7'),
        }}
      >
        <Box
          width="100%"
          height="100%"
          style={{
            borderRadius: '50%',
            background: 'black',
            overflow: 'hidden',
          }}
          position="relative"
        >
          <Target />

          <Box
            ref={reloadCore}
            width="100%"
            height="100%"
            position="absolute"
            top="0"
            left="0"
            style={{
              borderRadius: '50%',
              maskImage: 'radial-gradient(transparent 25%, black 100%)',
            }}
          />
        </Box>
      </Box>

      <img
        src="/assets/images/tankopedia/visualizers/reload/caret.png"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '10%',
          height: '10%',
        }}
      />

      <Code
        ref={progressTime}
        size="1"
        variant="ghost"
        weight="bold"
        color="gray"
        highContrast
        style={{
          position: 'absolute',
          top: '50%',
          right: 'calc(50% + var(--space-8))',
          transform: 'translateX(50%)',
        }}
      >
        0.00
      </Code>
      <Code
        ref={totalTime}
        size="1"
        variant="ghost"
        weight="bold"
        color="gray"
        style={{
          position: 'absolute',
          top: '50%',
          left: 'calc(50% + var(--space-8))',
          transform: 'translateX(-50%)',
        }}
      >
        0.00
      </Code>

      {stats.shells > 1 &&
        times(stats.shells, (index) => (
          <Shell stats={stats} index={index} key={index} />
        ))}

      <Box
        id="reload-visualizer-flash"
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
      />
    </VisualizerCard>
  );
}
