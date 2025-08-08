import { Card } from '@radix-ui/themes';
import { awaitableModelDefinitions } from '../../../../../../../core/awaitables/modelDefinitions';
import { DEFAULT_PITCH_TRANSITION } from '../../../../../../../core/blitz/applyPitchYawLimits';
import { Duel } from '../../../../../../../stores/duel';

const MAX_MAG = 20;

const modelDefinition = await awaitableModelDefinitions;

function mag(x: number) {
  return (x / MAX_MAG + 1) / 2;
}

function c(thetaDeg: number, m = 1) {
  const theta = thetaDeg * (Math.PI / 180);
  return `${m * Math.cos(theta)} ${-m * Math.sin(theta)}`;
}

export function GunFlexibilityVisualizer() {
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
  const ms = mag(p.max);
  if (y) {
    d += `M ${c(90 - y.max, ms)}`;
  } else if (b) {
    d += `M ${c(-90 + b.range / 2 + t, ms)}`;
  } else {
    d += `M ${c(-90 / 2, ms)}`;
  }
  if (f) {
    d += `A ${ms} ${ms} 0 0 0 ${c(90 - f.range / 2 - t, ms)}`;
  } else {
    d += `A ${ms} ${ms} 0 0 0 ${c(90 / 2, ms)}`;
  }

  // front
  if (f) {
    const m = mag(f.max);
    d += `L ${c(90 - f.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(90 + f.range / 2, m)}`;
  }

  // left
  if (f) {
    d += `L ${c(90 + f.range / 2 + t, ms)}`;
  } else {
    d += `L ${c(90 / 2, ms)}`;
  }
  if (y) {
    d += `A ${ms} ${ms} 0 0 0 ${c(90 - y.min, ms)}`;
  } else if (b) {
    d += `A ${ms} ${ms} 0 0 0 ${c(-90 - b.range / 2 - t, ms)}`;
  } else {
    d += `A ${ms} ${ms} 0 0 0 ${c(-90 / 2, ms)}`;
  }

  // back
  if (!y && b) {
    const m = mag(b.max);
    d += `L ${c(-90 - b.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(-90 + b.range / 2, m)}`;
  }

  d += `Z`;

  return (
    <Card style={{ aspectRatio: '1 / 1' }} variant="classic">
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
          stroke="var(--gray-11)"
          strokeWidth="0.01px"
          fill="var(--gray-9)"
          d={d}
        />
        <path
          stroke="var(--gray-2)"
          fill="transparent"
          strokeWidth="0.01px"
          strokeDasharray="0.05 0.01"
          d="M 0.5 0 A 0.5 0.5 0 1 1 -0.5 0 A 0.5 0.5 0 1 1 0.5 0 Z"
        />
      </svg>
    </Card>
  );
}
