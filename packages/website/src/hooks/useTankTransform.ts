import { I_HAT, J_HAT, K_HAT } from "@blitzkit/core";
import { TrackDefinition, TurretDefinition } from "@blitzkit/protos";
import { invalidate } from "@react-three/fiber";
import type { QuicklimeEvent } from "quicklime";
import { type RefObject, useEffect } from "react";
import { Euler, Group, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from "../core/blitzkit/modelTransform";
import { toThreeVector } from "../three/toThreeVector";
import { useDuelModel } from "./useDuelModel";

export function useTankTransform(
  track: TrackDefinition,
  turret: TurretDefinition,
  turretContainer: RefObject<Group>,
  gunContainer: RefObject<Group>,
) {
  const tankModelDefinition = useDuelModel("protagonist");

  useEffect(() => {
    const trackModelDefinition = tankModelDefinition.tracks[track.id];
    const turretModelDefinition = tankModelDefinition.turrets[turret.id];
    const hullOrigin = toThreeVector(trackModelDefinition.origin);
    const turretOrigin = toThreeVector(tankModelDefinition.turret_origin);
    const gunOrigin = toThreeVector(turretModelDefinition.gun_origin);
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

      turretPosition
        .set(0, 0, 0)
        .sub(hullOrigin)
        .sub(turretOrigin)
        .applyAxisAngle(J_HAT, yaw);
      turretRotation.set(0, yaw, 0);

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
          .applyAxisAngle(J_HAT, initialYaw)
          .applyAxisAngle(K_HAT, initialRoll);
        turretRotation.x += initialPitch;
        turretRotation.y += initialYaw;
        turretRotation.z += initialRoll;
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
