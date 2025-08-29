import {
  I_HAT,
  J_HAT,
  K_HAT,
  TrackDefinition,
  TurretDefinition,
} from '@blitzkit/core';
import { invalidate } from '@react-three/fiber';
import type { QuicklimeEvent } from 'quicklime';
import { type RefObject, useEffect } from 'react';
import { Euler, Group, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils.js';
import { correctZYTuple } from '../core/blitz/correctZYTuple';
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from '../core/blitzkit/modelTransform';
import { useTankModelDefinition } from './useTankModelDefinition';

export function useTankTransform(
  track: TrackDefinition,
  turret: TurretDefinition,
  turretContainer: RefObject<Group>,
  gunContainer: RefObject<Group>,
) {
  const tankModelDefinition = useTankModelDefinition();

  useEffect(() => {
    const trackModelDefinition = tankModelDefinition.tracks[track.id];
    const turretModelDefinition = tankModelDefinition.turrets[turret.id];
    const hullOrigin = correctZYTuple(trackModelDefinition.origin);
    const turretOrigin = correctZYTuple(tankModelDefinition.turret_origin);
    const gunOrigin = correctZYTuple(turretModelDefinition.gun_origin);
    const turretPosition = new Vector3();
    const turretRotation = new Euler();
    const gunPosition = new Vector3();
    const gunRotation = new Euler();

    function handleModelTransform(
      event: QuicklimeEvent<ModelTransformEventData>,
    ) {
      handleModelTransformInner(event.data);
    }

    function handleModelTransformInner(data?: ModelTransformEventData) {
      const yaw = data?.yaw ?? modelTransformEvent.last!.yaw;
      const pitch = data?.pitch ?? modelTransformEvent.last!.pitch;

      gunPosition
        .set(0, 0, 0)
        .sub(hullOrigin)
        .sub(turretOrigin)
        .sub(gunOrigin)
        .applyAxisAngle(I_HAT, pitch)
        .add(gunOrigin)
        .add(turretOrigin)
        .add(hullOrigin);
      gunRotation.set(pitch, 0, 0);
      gunContainer.current?.position.copy(gunPosition);
      gunContainer.current?.rotation.copy(gunRotation);

      if (yaw === undefined) return;

      turretPosition
        .set(0, 0, 0)
        .sub(hullOrigin)
        .sub(turretOrigin)
        .applyAxisAngle(new Vector3(0, 0, 1), yaw);
      turretRotation.set(0, 0, yaw);

      if (tankModelDefinition.initial_turret_rotation) {
        const initialPitch = -degToRad(
          tankModelDefinition.initial_turret_rotation.pitch,
        );
        const initialYaw = -degToRad(
          tankModelDefinition.initial_turret_rotation.yaw,
        );
        const initialRoll = -degToRad(
          tankModelDefinition.initial_turret_rotation.roll,
        );

        turretPosition
          .applyAxisAngle(I_HAT, initialPitch)
          .applyAxisAngle(J_HAT, initialRoll)
          .applyAxisAngle(K_HAT, initialYaw);
        turretRotation.x += initialPitch;
        turretRotation.y += initialRoll;
        turretRotation.z += initialYaw;
      }

      turretPosition.add(turretOrigin).add(hullOrigin);
      turretContainer.current?.position.copy(turretPosition);
      turretContainer.current?.rotation.copy(turretRotation);

      invalidate();
    }

    handleModelTransformInner();

    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  }, [track, turret]);
}
