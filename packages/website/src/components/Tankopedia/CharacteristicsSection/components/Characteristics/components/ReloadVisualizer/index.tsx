import { Box, Code } from '@radix-ui/themes';
import { times } from 'lodash-es';
import { Quicklime, type QuicklimeCallback } from 'quicklime';
import { useEffect, useRef } from 'react';
import { Var } from '../../../../../../../core/radix/var';
import type { StatsAcceptorProps } from '../TraverseVisualizer';
import { VisualizerCard } from '../VisualizerCard';
import { Shell } from './components/Shell';
import { Target } from './components/Target';

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

  /**
   * 3-shell gun example:
   *
   * 0-1: clip reload
   * ~~~: shell shot
   * 1-2: intra-clip
   * ~~~: shell shot
   * 2-3: intra-clip
   * ~~~: shell shot & reset to 0
   *
   * intra-clip time = intraClip * (n - 1)
   */
  const state = useRef(0);
  const dpm = useRef(0);
  const shotPool = useRef(new Set<number>());

  useEffect(() => {
    let cancel = false;
    let lastT = Date.now() / 1000;
    let lastState = state.current;
    const shellArray = new Array(stats.shells);

    function shoot() {
      shotPool.current.add(Date.now() / 1000);
      dpm.current += stats.damage;
    }

    function frame() {
      if (!totalTime.current || !progressTime.current) return;

      const now = Date.now() / 1000;
      const dt = now - lastT;
      let reload;
      let shells;

      shotPool.current.forEach((t) => {
        if (now - t > 60) shotPool.current.delete(t);
      });

      dpm.current = shotPool.current.size * stats.damage;

      if (state.current < 1) {
        state.current = Math.min(1, state.current + dt / stats.shellReload!);
        reload = state.current;
        shells = shellArray.fill(reload);

        totalTime.current.innerHTML = stats.shellReload!.toFixed(PRECISION);
        progressTime.current.innerHTML = (
          (1 - reload) *
          stats.shellReload!
        ).toFixed(PRECISION);

        if (state.current >= 1) shoot();
      } else if (state.current < stats.shells) {
        const interval =
          stats.burstShells === 1
            ? stats.intraClip!
            : Math.floor(state.current) % stats.burstShells === 0
              ? stats.intraClip!
              : stats.burstInterShell!;

        state.current = Math.min(stats.shells, state.current + dt / interval);
        shells = times(stats.shells, (index) => index > state.current - 1);
        reload = state.current % 1;

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
        width="12rem"
        height="12rem"
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
        width="12rem"
        height="12rem"
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
        6.9s
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
        10.0s
      </Code>

      {stats.shells > 1 &&
        times(stats.shells, (index) => (
          <Shell stats={stats} index={index} key={index} />
        ))}
    </VisualizerCard>
  );
}
