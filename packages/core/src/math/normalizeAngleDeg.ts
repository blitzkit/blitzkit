export function normalizeAngleDeg(angle: number) {
  const newAngle = angle % 360;
  if (newAngle > 360) return newAngle - 360;
  if (newAngle < -360) return newAngle + 360;
  return newAngle;
}
