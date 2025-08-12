import { HeightIcon, WidthIcon } from '@radix-ui/react-icons';
import { Flex, TextField } from '@radix-ui/themes';
import type { QuicklimeEvent } from 'quicklime';
import { useEffect, useRef } from 'react';
import { degToRad, radToDeg } from 'three/src/math/MathUtils.js';
import { applyPitchYawLimits } from '../../../../../../../core/blitz/applyPitchYawLimits';
import {
  type ModelTransformEventData,
  modelTransformEvent,
} from '../../../../../../../core/blitzkit/modelTransform';
import { useEquipment } from '../../../../../../../hooks/useEquipment';
import { useTankModelDefinition } from '../../../../../../../hooks/useTankModelDefinition';
import { Duel } from '../../../../../../../stores/duel';
import './index.css';

export function QuickInputs() {
  const mutateDuel = Duel.useMutation();
  const protagonist = Duel.use((state) => state.protagonist);
  const yawInput = useRef<HTMLInputElement>(null);
  const pitchInput = useRef<HTMLInputElement>(null);
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[protagonist.gun.gun_type!.value.base.id];
  const initialGunPitch =
    tankModelDefinition.initial_turret_rotation?.pitch ?? 0;
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const hasDownImprovedVerticalStabilizer = useEquipment(124);

  useEffect(() => {
    function handleTransformEvent(
      event: QuicklimeEvent<ModelTransformEventData>,
    ) {
      if (!pitchInput.current || !yawInput.current) return;

      pitchInput.current.value = (
        -radToDeg(event.data.pitch) +
        (tankModelDefinition.initial_turret_rotation?.pitch ?? 0)
      ).toFixed(1);

      if (event.data.yaw === undefined) return;

      yawInput.current.value = radToDeg(event.data.yaw).toFixed(1);
    }

    modelTransformEvent.on(handleTransformEvent);

    return () => {
      modelTransformEvent.off(handleTransformEvent);
    };
  }, []);

  return (
    <Flex
      align="center"
      gap="2"
      width="4rem"
      direction="column"
      style={{
        pointerEvents: 'auto',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        transitionDuration: '0.2s',
      }}
      className="quick-inputs"
    >
      <TextField.Root
        variant="classic"
        size="1"
        radius="full"
        style={{ flex: 1, textAlign: 'right' }}
        defaultValue="0.0"
        onBlur={() => {
          const value = Number(yawInput.current!.value);

          if (isNaN(value)) {
            yawInput.current!.value = radToDeg(
              modelTransformEvent.last!.yaw,
            ).toFixed(1);
            return;
          }

          const [pitch, yaw] = applyPitchYawLimits(
            modelTransformEvent.last!.pitch,
            degToRad(value),
            gunModelDefinition.pitch,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );

          modelTransformEvent.dispatch({ pitch, yaw });
          yawInput.current!.value = radToDeg(
            modelTransformEvent.last!.yaw,
          ).toFixed(1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            yawInput.current?.blur();
          }
        }}
        onFocus={() => yawInput.current?.focus()}
        ref={yawInput}
      >
        <TextField.Slot style={{ userSelect: 'none' }}>
          <WidthIcon />
        </TextField.Slot>
        <TextField.Slot />
      </TextField.Root>

      <TextField.Root
        variant="classic"
        size="1"
        radius="full"
        style={{ flex: 1, textAlign: 'right' }}
        defaultValue="0.0"
        onBlur={() => {
          const value = Number(pitchInput.current!.value);
          if (isNaN(value)) {
            pitchInput.current!.value = (
              -radToDeg(modelTransformEvent.last!.pitch) + initialGunPitch
            ).toFixed(1);
            return;
          }
          const [pitch, yaw] = applyPitchYawLimits(
            degToRad(-value + initialGunPitch),
            modelTransformEvent.last!.yaw,
            gunModelDefinition.pitch,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );
          modelTransformEvent.dispatch({ pitch, yaw });
          pitchInput.current!.value = (
            -radToDeg(modelTransformEvent.last!.pitch) + initialGunPitch
          ).toFixed(1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            pitchInput.current?.blur();
          }
        }}
        onFocus={() => pitchInput.current?.focus()}
        ref={pitchInput}
      >
        <TextField.Slot
          style={{
            userSelect: 'none',
          }}
        >
          <HeightIcon />
        </TextField.Slot>
        <TextField.Slot />
      </TextField.Root>
    </Flex>
  );
}
