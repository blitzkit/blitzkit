import { I_HAT, J_HAT } from "@blitzkit/core";
import { invalidate, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, type RefObject } from "react";
import { Quaternion, Vector2, Vector3 } from "three";
import {
  cameraSwingHorizontalAmplitude,
  cameraSwingHorizontalFrequency,
  cameraSwingVerticalAmplitude,
  cameraSwingVerticalFrequency,
  initialCameraPhi,
  initialCameraR,
  initialCameraTheta,
} from "../config/camera";
import { Tankopedia } from "../stores/tankopedia";

const clientPosition = new Vector2();
const workingVector3 = new Vector3();
const workingQuaternion = new Quaternion();

const cameraCenter = new Vector3(0, 1, 0);

const PHI_EPSILON = 2 ** -8;

export function TankopediaControls() {
  const canvas = useThree((state) => state.gl.domElement);
  const camera = useThree((state) => state.camera);

  const r = useRef(initialCameraR);
  const phi = useRef(initialCameraPhi);
  const theta = useRef(initialCameraTheta);

  const disturbed = Tankopedia.use((state) => state.disturbed);

  const updateCameraPosition = useCallback(() => {
    workingVector3
      .set(
        Math.sin(phi.current) * Math.sin(theta.current),
        Math.cos(phi.current),
        Math.sin(phi.current) * Math.cos(theta.current),
      )
      .multiplyScalar(r.current);
    camera.position.copy(cameraCenter).add(workingVector3);

    workingQuaternion.setFromAxisAngle(I_HAT, phi.current - Math.PI / 2);
    camera.quaternion
      .setFromAxisAngle(J_HAT, theta.current)
      .multiply(workingQuaternion);

    invalidate();
  }, []);

  useEffect(() => {
    updateCameraPosition();

    function handlePointerDown(event: PointerEvent) {
      Tankopedia.mutate((draft) => {
        draft.disturbed = true;
      });

      clientPosition.set(event.clientX, event.clientY);

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      workingVector3.copy(camera.position).sub(cameraCenter);

      r.current = workingVector3.length();
      const dx = event.movementX / window.innerWidth;
      const dy = event.movementY / window.innerHeight;

      const dTheta = -dx * Math.PI;
      const dPhi = -dy * Math.PI;

      theta.current = Math.atan2(workingVector3.x, workingVector3.z) + dTheta;
      const phi0 = Math.acos(workingVector3.y / r.current);
      phi.current = phi0 + dPhi;
      const maxPhi =
        Math.PI / 2 + Math.asin(cameraCenter.y / r.current) - PHI_EPSILON;

      if (phi.current < 0 || phi.current > maxPhi) phi.current = phi0;

      updateCameraPosition();
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    canvas.addEventListener("pointerdown", handlePointerDown);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    !disturbed && (
      <Swing
        r={r}
        phi={phi}
        theta={theta}
        updateCameraPosition={updateCameraPosition}
      />
    )
  );
}

interface SwingProps {
  r: RefObject<number>;
  phi: RefObject<number>;
  theta: RefObject<number>;
  updateCameraPosition: () => void;
}

export function Swing({ r, phi, theta, updateCameraPosition }: SwingProps) {
  useFrame(({ clock }) => {
    const t = 2 * Math.PI * clock.getElapsedTime();

    phi.current =
      initialCameraPhi +
      cameraSwingVerticalAmplitude * Math.cos(cameraSwingVerticalFrequency * t);
    theta.current =
      initialCameraTheta +
      cameraSwingHorizontalAmplitude *
        Math.sin(cameraSwingHorizontalFrequency * t);

    updateCameraPosition();
  });

  return null;
}
