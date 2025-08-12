import { literals } from '@blitzkit/i18n';
import { Box, Card, Flex } from '@radix-ui/themes';
import { clamp } from 'lodash-es';
import { useRef, useState } from 'react';
import { degToRad, radToDeg } from 'three/src/math/MathUtils.js';
import { awaitableModelDefinitions } from '../../../../../../../core/awaitables/modelDefinitions';
import {
  DEFAULT_PITCH_TRANSITION,
  applyPitchYawLimits,
} from '../../../../../../../core/blitz/applyPitchYawLimits';
import { hasEquipment } from '../../../../../../../core/blitzkit/hasEquipment';
import { modelTransformEvent } from '../../../../../../../core/blitzkit/modelTransform';
import { Var } from '../../../../../../../core/radix/var';
import { useLocale } from '../../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../../stores/duel';
import type { MaybeSkeletonComponentProps } from '../../../../../../../types/maybeSkeletonComponentProps';
import { VisualizerCard } from '../VisualizerCard';
import { VisualizerCornerStat } from '../VisualizerCornerStat';
import { FlexibilityCanvas } from './components/FlexibilityCanvas';

const ANGLE_COEFFICIENT = 1 / 10;
const CONIC_TRANSITION = degToRad(0);

const modelDefinition = await awaitableModelDefinitions;

function mag(x: number) {
  return (1 / Math.PI) * Math.atan(ANGLE_COEFFICIENT * x) + 1 / 2;
}

function magInverse(y: number): number {
  return (1 / ANGLE_COEFFICIENT) * Math.tan(Math.PI * y - Math.PI / 2);
}

function c(thetaDeg: number, m = 1) {
  const theta = thetaDeg * (Math.PI / 180);
  return `${m * Math.cos(theta)} ${-m * Math.sin(theta)}`;
}

export function GunFlexibilityVisualizer({
  skeleton,
}: MaybeSkeletonComponentProps) {
  const { strings } = useLocale();

  const duelStore = Duel.useStore();
  const tank = Duel.use((state) => state.protagonist.tank);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);

  const tankModel = modelDefinition.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];
  const gunModel = turretModel.guns[gun.gun_type!.value.base.id];

  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [minPitch, setMinPitch] = useState(
    -degToRad(gunModel.pitch.front?.max ?? gunModel.pitch.max),
  );
  const [maxPitch, setMaxPitch] = useState(
    -degToRad(gunModel.pitch.front?.min ?? gunModel.pitch.min),
  );

  const container = useRef<HTMLDivElement>(null);
  const highlighter = useRef<HTMLDivElement>(null);
  const pointer = useRef<HTMLDivElement>(null);

  const p = gunModel.pitch;
  const y = turretModel.yaw;
  const f = p.front;
  const b = p.back;
  const t = gunModel.pitch.transition ?? DEFAULT_PITCH_TRANSITION;

  let d = '';

  // right
  const mo = mag(p.max);
  if (y) {
    d += `M 0 0`;
    d += `L ${c(90 - y.max, mo)}`;
  } else if (b) {
    d += `M ${c(-90 + b.range / 2 + t, mo)}`;
  } else {
    d += `M ${c(-90, mo)}`;
  }
  if (f) {
    d += `A ${mo} ${mo} 0 0 0 ${c(90 - f.range / 2 - t, mo)}`;
  } else {
    d += `A ${mo} ${mo} 0 0 0 ${c(90, mo)}`;
  }

  // front
  if (f) {
    const m = mag(f.max);
    d += `L ${c(90 - f.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(90 + f.range / 2, m)}`;
  }

  // left
  if (f) {
    d += `L ${c(90 + f.range / 2 + t, mo)}`;
  } else {
    d += `L ${c(90, mo)}`;
  }
  if (y) {
    d += `A ${mo} ${mo} 0 0 0 ${c(90 - y.min, mo)}`;
  } else if (b) {
    d += `A ${mo} ${mo} 0 0 0 ${c(-90 - b.range / 2 - t, mo)}`;
  } else {
    d += `A ${mo} ${mo} 0 0 0 ${c(-90, mo)}`;
  }

  // back
  if (!y && b) {
    const m = mag(b.max);
    d += `L ${c(-90 - b.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(-90 + b.range / 2, m)}`;
  }

  d += `Z`;

  // right
  const mi = mag(p.min);
  if (y) {
    d += `M 0 0`;
    d += `L ${c(90 - y.max, mi)}`;
  } else if (b) {
    d += `M ${c(-90 + b.range / 2 + t, mi)}`;
  } else {
    d += `M ${c(-90, mi)}`;
  }
  if (f) {
    d += `A ${mi} ${mi} 0 0 0 ${c(90 - f.range / 2 - t, mi)}`;
  } else {
    d += `A ${mi} ${mi} 0 0 0 ${c(90, mi)}`;
  }

  // front
  if (f) {
    const m = mag(f.min);
    d += `L ${c(90 - f.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(90 + f.range / 2, m)}`;
  }

  // left
  if (f) {
    d += `L ${c(90 + f.range / 2 + t, mi)}`;
  } else {
    d += `L ${c(90, mi)}`;
  }
  if (y) {
    d += `A ${mi} ${mi} 0 0 0 ${c(90 - y.min, mi)}`;
  } else if (b) {
    d += `A ${mi} ${mi} 0 0 0 ${c(-90 - b.range / 2 - t, mi)}`;
  } else {
    d += `A ${mi} ${mi} 0 0 0 ${c(-90, mi)}`;
  }

  // back
  if (!y && b) {
    const m = mag(b.min);
    d += `L ${c(-90 - b.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(-90 + b.range / 2, m)}`;
  }

  d += `Z`;

  const r = mag(radToDeg(-pitch));
  const dotX = r * Math.sin(yaw);
  const dotY = r * Math.cos(yaw);

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

            <Box
              position="absolute"
              width="100%"
              height="100%"
              top="0"
              left="33%"
              style={{
                background: `conic-gradient(
                  at 0 50%,
                  
                  transparent,
                  ${Var('orange-a2')} ${Math.PI / 2 - maxPitch - CONIC_TRANSITION}rad,

                  ${Var('cyan-a6')} ${Math.PI / 2 - maxPitch}rad,
                  ${Var('jade-a6')} ${Math.PI / 2 - minPitch}rad,

                  ${Var('orange-a2')} ${Math.PI / 2 - minPitch + CONIC_TRANSITION}rad,
                  transparent 180deg
                )`,
              }}
            />
          </Box>
        </Card>
      </Box>

      <VisualizerCard
        ref={container}
        style={{ touchAction: 'none' }}
        onPointerMove={(event) => {
          event.preventDefault();

          if (!container.current || !highlighter.current || !pointer.current)
            return;

          const rect = container.current.getBoundingClientRect();
          const u = event.clientX - rect.left - rect.width / 2;
          const v = event.clientY - rect.top - rect.height / 2;
          let yaw = Math.atan2(u, -v);

          const {
            equipmentMatrix,
            tank: { equipment_preset },
          } = duelStore.getState().protagonist;
          const hasImprovedVerticalStabilizer = hasEquipment(
            122,
            equipment_preset,
            equipmentMatrix,
          );
          const hasDownImprovedVerticalStabilizer = hasEquipment(
            124,
            equipment_preset,
            equipmentMatrix,
          );

          const min = applyPitchYawLimits(
            -Math.PI,
            yaw,
            p,
            y,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );
          const max = applyPitchYawLimits(
            Math.PI,
            yaw,
            p,
            y,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );

          yaw = min[1];
          let t = 2 * Math.sqrt((u / rect.width) ** 2 + (v / rect.height) ** 2);
          t = clamp(t, 0, 1);
          let pitch = degToRad(magInverse(-t));
          pitch = clamp(pitch, min[0], max[0]);

          setPitch(pitch);
          setYaw(yaw);
          setMinPitch(min[0]);
          setMaxPitch(max[0]);

          modelTransformEvent.dispatch({ pitch, yaw });
        }}
        mb="0"
      >
        <Box
          ref={highlighter}
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          style={{
            borderRadius: Var('radius-2'),
            overflow: 'hidden',
          }}
        >
          <Box
            width="100%"
            height="100%"
            style={{
              opacity: 2 ** -3,
              backgroundImage: `url(/assets/images/tankopedia/visualizers/ricochet/armor-hash.png)`,
            }}
          />
        </Box>

        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 'calc(100%)',
            height: 'calc(100%)',
          }}
          viewBox="-1 -1 2 2"
        >
          <path
            fillRule="evenodd"
            fill="var(--gray-5)"
            stroke="var(--gray-8)"
            strokeWidth="1px"
            vectorEffect="non-scaling-stroke"
            d={d}
          />

          <path
            stroke="var(--gray-11)"
            fill="transparent"
            strokeWidth="1px"
            strokeDasharray="0.5rem 0.5rem"
            vectorEffect="non-scaling-stroke"
            d={`
            M 0.5 0
            A 0.5 0.5 0 1 1 -0.5 0
            A 0.5 0.5 0 1 1 0.5 0
            Z
          `}
          />
        </svg>

        <Box
          ref={pointer}
          position="absolute"
          top="50%"
          left="50%"
          width="0"
          height="0"
          style={{
            transform: `translate(-50%, -50%) rotate(${yaw + Math.PI}rad)`,
          }}
        >
          <Box
            width="1pt"
            height="14rem"
            style={{
              borderRadius: Var('radius-1'),
              background: `linear-gradient(${Var('gray-a11')}, ${Var('gray-a6')})`,
              transform: 'translateX(-50%)',
            }}
          />
        </Box>

        <Box
          position="absolute"
          left={`${50 * (dotX + 1)}%`}
          bottom={`${50 * (dotY + 1)}%`}
          width="0.25rem"
          height="0.25rem"
          style={{
            borderRadius: '50%',
            backgroundColor: Var('gray-12'),
            transform: 'translate(-50%, 50%)',
          }}
        />

        <VisualizerCornerStat
          label={
            strings.website.tools.tankopedia.visualizers.flexibility.elevation
          }
          value={literals(strings.common.units.deg, [
            radToDeg(maxPitch).toFixed(0),
          ])}
          side="top-left"
        />

        <VisualizerCornerStat
          label={
            strings.website.tools.tankopedia.visualizers.flexibility.depression
          }
          value={literals(strings.common.units.deg, [
            radToDeg(-minPitch).toFixed(0),
          ])}
          side="top-right"
        />

        <VisualizerCornerStat
          label={strings.website.tools.tankopedia.visualizers.flexibility.pitch}
          value={literals(strings.common.units.deg, [
            radToDeg(pitch).toFixed(0),
          ])}
          side="bottom-left"
        />

        <VisualizerCornerStat
          label={strings.website.tools.tankopedia.visualizers.flexibility.yaw}
          value={literals(strings.common.units.deg, [radToDeg(yaw).toFixed(0)])}
          side="bottom-right"
        />
      </VisualizerCard>
    </Flex>
  );
}
