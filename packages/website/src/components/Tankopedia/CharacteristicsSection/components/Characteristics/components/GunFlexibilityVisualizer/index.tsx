import { literals } from '@blitzkit/i18n';
import { Box } from '@radix-ui/themes';
import { useRef, useState } from 'react';
import { radToDeg } from 'three/src/math/MathUtils.js';
import { awaitableModelDefinitions } from '../../../../../../../core/awaitables/modelDefinitions';
import {
  applyPitchYawLimits,
  DEFAULT_PITCH_TRANSITION,
} from '../../../../../../../core/blitz/applyPitchYawLimits';
import { hasEquipment } from '../../../../../../../core/blitzkit/hasEquipment';
import { Var } from '../../../../../../../core/radix/var';
import { useLocale } from '../../../../../../../hooks/useLocale';
import { Duel } from '../../../../../../../stores/duel';
import { VisualizerCard } from '../VisualizerCard';
import { VisualizerCornerStat } from '../VisualizerCornerStat';

const ANGLE_COEFFICIENT = 1 / 10;

const modelDefinition = await awaitableModelDefinitions;

function mag(x: number) {
  return ((2 / Math.PI) * Math.atan(ANGLE_COEFFICIENT * x) + 1) / 2;
}

function c(thetaDeg: number, m = 1) {
  const theta = thetaDeg * (Math.PI / 180);
  return `${m * Math.cos(theta)} ${-m * Math.sin(theta)}`;
}

export function GunFlexibilityVisualizer() {
  const { strings } = useLocale();

  const [yaw, setYaw] = useState(0);
  const [minPitch, setMinPitch] = useState(0);
  const [maxPitch, setMaxPitch] = useState(0);

  const container = useRef<HTMLDivElement>(null);
  const highlighter = useRef<HTMLDivElement>(null);
  const pointer = useRef<HTMLDivElement>(null);

  const duelStore = Duel.useStore();
  const tank = Duel.use((state) => state.protagonist.tank);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);

  const tankModel = modelDefinition.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];
  const gunModel = turretModel.guns[gun.gun_type!.value.base.id];

  const p = gunModel.pitch;
  const y = turretModel.yaw;
  const f = p.front;
  const b = p.back;
  const t = gunModel.pitch.transition ?? DEFAULT_PITCH_TRANSITION;

  let d = '';

  // right
  const mo = mag(p.max);
  if (y) {
    d += `M ${c(90 - y.max, mo)}`;
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
    d += `M ${c(90 - y.max, mi)}`;
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

  return (
    <VisualizerCard
      ref={container}
      onPointerMove={(event) => {
        if (!container.current || !highlighter.current || !pointer.current)
          return;

        const rect = container.current.getBoundingClientRect();
        const u = event.clientX - rect.left - rect.width / 2;
        const v = event.clientY - rect.top - rect.height / 2;
        const yaw = Math.atan2(u, -v);

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

        setYaw(min[1]);
        setMinPitch(min[0]);
        setMaxPitch(max[0]);
      }}
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
          fill="var(--gray-6)"
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
          d="M 0.5 0 A 0.5 0.5 0 1 1 -0.5 0 A 0.5 0.5 0 1 1 0.5 0 Z"
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
            background: `linear-gradient(${Var('gray-a6')}, ${Var('gray-a11')})`,
            transform: 'translateX(-50%)',
          }}
        />
      </Box>

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
        label={strings.website.tools.tankopedia.visualizers.flexibility.yaw}
        value={literals(strings.common.units.deg, [radToDeg(yaw).toFixed(0)])}
        side="bottom-left"
      />
    </VisualizerCard>
  );
}
