import { GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, Quaternion, Spherical, Sprite, Vector3 } from "three";
import { type OrbitControls as OrbitControlsImpl } from "three-stdlib";

const GIZMO_MARGIN = 80;
const GIZMO_TURN_RATE = 2 * Math.PI;
const GIZMO_MIN_POLAR_ANGLE = 0.001;
const GIZMO_DONE_ANGLE = 0.001;

export function AxisGizmo() {
  const controls = useThree(
    (state) => state.controls,
  ) as OrbitControlsImpl | null;
  const goal = useRef<Vector3 | null>(null);

  useFrame((_, delta) => {
    if (!controls || !goal.current) return;

    const offset = controls.object.position.clone().sub(controls.target);
    const distance = offset.length();
    const current = offset.normalize();
    const angle = current.angleTo(goal.current);

    if (angle < GIZMO_DONE_ANGLE) {
      goal.current = null;
      return;
    }

    const turn = new Quaternion().slerp(
      new Quaternion().setFromUnitVectors(current, goal.current),
      Math.min(1, (GIZMO_TURN_RATE * delta) / angle),
    );

    controls.object.position
      .copy(controls.target)
      .addScaledVector(current.applyQuaternion(turn), distance);
    controls.update();
  });

  return (
    <GizmoHelper alignment="top-left" margin={[GIZMO_MARGIN, GIZMO_MARGIN]}>
      <group
        onPointerDown={(event) => {
          event.stopPropagation();

          if (!controls || !(event.object instanceof Sprite)) return;

          const direction = event.object.position.clone().normalize();
          const current = new Spherical().setFromVector3(
            controls.object.position.clone().sub(controls.target),
          );
          const spherical = new Spherical().setFromVector3(direction);

          if (Math.abs(direction.y) === 1) spherical.theta = current.theta;

          spherical.phi = MathUtils.clamp(
            spherical.phi,
            GIZMO_MIN_POLAR_ANGLE,
            Math.PI - GIZMO_MIN_POLAR_ANGLE,
          );
          goal.current = new Vector3().setFromSpherical(spherical);
        }}
      >
        <GizmoViewport disabled />
      </group>
    </GizmoHelper>
  );
}
