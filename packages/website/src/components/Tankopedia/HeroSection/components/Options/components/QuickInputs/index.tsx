import { HeightIcon, WidthIcon } from '@radix-ui/react-icons';
import { Flex, TextField } from '@radix-ui/themes';
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
    if (!yawInput.current) return;

    yawInput.current.value = radToDeg(protagonist.yaw).toFixed(1);
  }, [protagonist.yaw]);

  useEffect(() => {
    if (!pitchInput.current) return;

    pitchInput.current.value = (
      -radToDeg(protagonist.pitch) + initialGunPitch
    ).toFixed(1);
  }, [protagonist.pitch]);

  useEffect(() => {
    function handleTransformEvent({ pitch, yaw }: ModelTransformEventData) {
      if (!pitchInput.current || !yawInput.current) return;

      pitchInput.current.value = (
        -radToDeg(pitch) +
        (tankModelDefinition.initial_turret_rotation?.pitch ?? 0)
      ).toFixed(1);

      if (yaw === undefined) return;

      yawInput.current.value = radToDeg(yaw).toFixed(1);
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
            yawInput.current!.value = radToDeg(protagonist.yaw).toFixed(1);
            return;
          }
          const [pitch, yaw] = applyPitchYawLimits(
            protagonist.pitch,
            degToRad(value),
            gunModelDefinition.pitch,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );
          modelTransformEvent.dispatch({ pitch, yaw });
          mutateDuel((state) => {
            state.protagonist.pitch = pitch;
            state.protagonist.yaw = yaw;
          });
          yawInput.current!.value = radToDeg(protagonist.yaw).toFixed(1);
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
              -radToDeg(protagonist.pitch) + initialGunPitch
            ).toFixed(1);
            return;
          }
          const [pitch, yaw] = applyPitchYawLimits(
            degToRad(-value + initialGunPitch),
            protagonist.yaw,
            gunModelDefinition.pitch,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );
          modelTransformEvent.dispatch({ pitch, yaw });
          mutateDuel((state) => {
            state.protagonist.pitch = pitch;
            state.protagonist.yaw = yaw;
          });
          pitchInput.current!.value = (
            -radToDeg(protagonist.pitch) + initialGunPitch
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
