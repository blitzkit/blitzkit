import { normalizeAngleDeg } from "@blitzkit/core";
import type { PitchLimit } from "@protos/blitz_static_tank_upgrade_single_stage";
import { clamp, degToRad, lerp, radToDeg } from "three/src/math/MathUtils.js";

export function applyPitchYawLimits(
  givenPitch: number,
  givenYaw: number,
  pitchLimitsUp: PitchLimit[],
  pitchLimitsDown: PitchLimit[]
) {
  const givenYawDeg = normalizeAngleDeg(radToDeg(givenYaw));
  const givenPitchDeg = normalizeAngleDeg(radToDeg(givenPitch));

  const yawDeg = givenYawDeg;
  const yaw = degToRad(givenYawDeg);

  let leftLimitUp: PitchLimit | undefined;
  let rightLimitUp: PitchLimit | undefined;
  let leftLimitDown: PitchLimit | undefined;
  let rightLimitDown: PitchLimit | undefined;

  for (const limit of pitchLimitsUp) {
    const normalizedAngle = normalizeAngleDeg(limit.angle);

    if (normalizedAngle <= yawDeg) {
      if (
        !leftLimitUp ||
        normalizeAngleDeg(yawDeg - normalizedAngle) <
          normalizeAngleDeg(yawDeg - leftLimitUp.angle)
      ) {
        leftLimitUp = limit;
      }
    }

    if (normalizedAngle >= yawDeg) {
      if (
        !rightLimitUp ||
        normalizeAngleDeg(normalizedAngle - yawDeg) <
          normalizeAngleDeg(rightLimitUp.angle - yawDeg)
      ) {
        rightLimitUp = limit;
      }
    }
  }

  for (const limit of pitchLimitsDown) {
    const normalizedAngle = normalizeAngleDeg(limit.angle);

    if (normalizedAngle <= yawDeg) {
      if (
        !leftLimitDown ||
        normalizeAngleDeg(yawDeg - normalizedAngle) <
          normalizeAngleDeg(yawDeg - leftLimitDown.angle)
      ) {
        leftLimitDown = limit;
      }
    }

    if (normalizedAngle >= yawDeg) {
      if (
        !rightLimitDown ||
        normalizeAngleDeg(normalizedAngle - yawDeg) <
          normalizeAngleDeg(rightLimitDown.angle - yawDeg)
      ) {
        rightLimitDown = limit;
      }
    }
  }

  if (!leftLimitUp || !rightLimitUp || !leftLimitDown || !rightLimitDown) {
    throw new Error("Pitch limits not found");
  }

  const spanUp = rightLimitUp.angle - leftLimitUp.angle;
  const spanDown = rightLimitDown.angle - leftLimitDown.angle;

  let limitUp: number;
  let limitDown: number;

  if (spanUp === 0) {
    limitUp = leftLimitUp.limit;
  } else {
    const delta = givenYawDeg - leftLimitUp.angle;
    const t = delta / spanUp;
    limitUp = lerp(leftLimitUp.limit, rightLimitUp.limit, t);
  }

  if (spanDown === 0) {
    limitDown = leftLimitDown.limit;
  } else {
    const delta = givenYawDeg - leftLimitDown.angle;
    const t = delta / spanDown;
    limitDown = lerp(leftLimitDown.limit, rightLimitDown.limit, t);
  }

  const pitchDeg = clamp(givenPitchDeg, -limitDown, limitUp);
  const pitch = degToRad(pitchDeg);

  return { pitch, yaw };
}
