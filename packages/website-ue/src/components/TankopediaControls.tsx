import { I_HAT, J_HAT } from "@blitzkit/core";
import { invalidate, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Quaternion, Vector2, Vector3 } from "three";
import {
  initialCameraPhi,
  initialCameraR,
  initialCameraTheta,
} from "../config/camera";

const clientPosition = new Vector2();
const workingVector3 = new Vector3();
const workingQuaternion = new Quaternion();

const cameraCenter = new Vector3(0, 1, 0);

const PHI_EPSILON = 2 ** -8;

export function TankopediaControls() {
  const canvas = useThree((state) => state.gl.domElement);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    setCameraPosition(initialCameraR, initialCameraPhi, initialCameraTheta);

    function handlePointerDown(event: PointerEvent) {
      clientPosition.set(event.clientX, event.clientY);

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      workingVector3.copy(camera.position).sub(cameraCenter);

      const r = workingVector3.length();
      const dx = event.movementX / window.innerWidth;
      const dy = event.movementY / window.innerHeight;

      const dTheta = -dx * Math.PI;
      const dPhi = -dy * Math.PI;

      const theta = Math.atan2(workingVector3.x, workingVector3.z) + dTheta;
      const phi0 = Math.acos(workingVector3.y / r);
      let phi = phi0 + dPhi;
      const maxPhi = Math.PI / 2 + Math.asin(cameraCenter.y / r) - PHI_EPSILON;

      if (phi < 0 || phi > maxPhi) phi = phi0;

      setCameraPosition(r, phi, theta);
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    function setCameraPosition(r: number, phi: number, theta: number) {
      workingVector3
        .set(
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.cos(theta),
        )
        .multiplyScalar(r);
      camera.position.copy(cameraCenter).add(workingVector3);

      workingQuaternion.setFromAxisAngle(I_HAT, phi - Math.PI / 2);
      camera.quaternion
        .setFromAxisAngle(J_HAT, theta)
        .multiply(workingQuaternion);

      invalidate();
    }

    canvas.addEventListener("pointerdown", handlePointerDown);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return null;
}
