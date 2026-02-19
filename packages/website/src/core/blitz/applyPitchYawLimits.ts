import {
  normalizeAngleRad,
  type PitchLimits,
  type YawLimits,
} from "@blitzkit/core";
import { clamp } from "lodash-es";
import { degToRad } from "three/src/math/MathUtils.js";

export const DEFAULT_PITCH_TRANSITION = 15;

export function applyPitchYawLimits(
  pitch: number, // rad
  yaw: number, // rad
  pitchLimits: PitchLimits, // deg
  yawLimits?: YawLimits, // deg
  verticalStabilizer = false,
  downVerticalStabilizer = false,
) {
  let newPitch = pitch;
  let newYaw = yaw;

  if (yawLimits) {
    newYaw = normalizeAngleRad(
      clamp(newYaw, -degToRad(yawLimits.max), -degToRad(yawLimits.min)),
    );
  }

  const depressionBuff =
    verticalStabilizer || downVerticalStabilizer ? degToRad(3) : 0;
  const elevationBuff = verticalStabilizer ? degToRad(4) : 0;
  let lowerPitch = -degToRad(pitchLimits.max) - depressionBuff;
  let upperPitch = -degToRad(pitchLimits.min) + elevationBuff;
  const transition = degToRad(
    pitchLimits.transition ?? DEFAULT_PITCH_TRANSITION,
  );

  if (pitchLimits.back) {
    const range = degToRad(pitchLimits.back.range);
    const yawRotatedAbs = Math.abs(normalizeAngleRad(newYaw - Math.PI));

    if (yawRotatedAbs <= range / 2 + transition) {
      if (yawRotatedAbs <= range / 2) {
        // inside range
        lowerPitch = -degToRad(pitchLimits.back.max);
        upperPitch = -degToRad(pitchLimits.back.min);
      } else {
        // inside transition
        const transitionProgress = (yawRotatedAbs - range / 2) / transition;
        // console.log(transitionProgress);
        const maxInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.back.max +
          transitionProgress * pitchLimits.max;
        const minInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.back.min +
          transitionProgress * pitchLimits.min;

        lowerPitch = -degToRad(maxInterpolatedPitch);
        upperPitch = -degToRad(minInterpolatedPitch);
      }
    }
  }

  if (pitchLimits.front) {
    const range = degToRad(pitchLimits.front.range);
    const yawAbs = Math.abs(normalizeAngleRad(newYaw));

    if (yawAbs <= range / 2 + transition) {
      if (yawAbs <= range / 2) {
        // inside range
        lowerPitch = -degToRad(pitchLimits.front.max);
        upperPitch = -degToRad(pitchLimits.front.min);
      } else {
        // inside transition
        const transitionProgress = (yawAbs - range / 2) / transition;
        const maxInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.front.max +
          transitionProgress * pitchLimits.max;
        const minInterpolatedPitch =
          (1 - transitionProgress) * pitchLimits.front.min +
          transitionProgress * pitchLimits.min;

        lowerPitch = -degToRad(maxInterpolatedPitch);
        upperPitch = -degToRad(minInterpolatedPitch);
      }
    }
  }

  newPitch = clamp(newPitch, lowerPitch, upperPitch);

  return [newPitch, normalizeAngleRad(newYaw)] as const;
}
