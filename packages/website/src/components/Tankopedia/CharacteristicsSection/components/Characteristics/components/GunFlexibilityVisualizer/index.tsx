import { Card } from '@radix-ui/themes';
import { awaitableModelDefinitions } from '../../../../../../../core/awaitables/modelDefinitions';
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
  const f = p.front;
  const b = p.back;

  let d = '';

  d += `M 0 0`;
  const ms = mag(p.max);
  if (b) {
    d += `L ${c(-90 + b.range / 2, ms)}`;
  } else {
    d += `L ${c(-90 / 2, ms)}`;
  }
  if (f) {
    d += `A ${ms} ${ms} 0 0 0 ${c(90 + f.range / 2, ms)}`;
  } else {
    d += `A ${ms} ${ms} 0 0 0 ${c(90 / 2, ms)}`;
  }

  d += `M 0 0`;
  if (f) {
    d += `L ${c(90 + f.range / 2, ms)}`;
  } else {
    d += `L ${c(90 / 2, ms)}`;
  }
  if (b) {
    d += `A ${ms} ${ms} 0 0 0 ${c(-90 - b.range / 2, ms)}`;
  } else {
    d += `A ${ms} ${ms} 0 0 0 ${c(-90 / 2, ms)}`;
  }

  if (f) {
    const m = mag(f.max);
    d += `M 0 0`;
    d += `L ${c(90 - f.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(90 + f.range / 2, m)}`;
    d += `Z`;
  }

  if (b) {
    const m = mag(b.max);
    d += `M 0 0`;
    d += `L ${c(-90 - b.range / 2, m)}`;
    d += `A ${m} ${m} 0 0 0 ${c(-90 + b.range / 2, m)}`;
    d += `Z`;
  }

  return (
    <Card style={{ aspectRatio: '1 / 1' }} variant="classic">
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        viewBox="-1 -1 2 2"
      >
        <path
          fill="var(--gray-1)"
          d="M 0.5 0 A 0.5 0.5 0 1 1 -0.5 0 A 0.5 0.5 0 1 1 0.5 0 Z"
        />
        <path fill="var(--gray-11)" d={d} />
      </svg>
    </Card>
  );
}
