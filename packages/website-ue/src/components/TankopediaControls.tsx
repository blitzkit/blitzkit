import { J_HAT, K_HAT } from "@blitzkit/core";
import { invalidate, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Vector2, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";

const initialDistance = 8;
const initialRotation = new Vector2(degToRad(45), degToRad(45));

const clientPosition = new Vector2();
const workingVector2 = new Vector2();
const workingVector3 = new Vector3();

const cameraCenter = new Vector3(0, 1, 0);

const cameraRotation = initialRotation.clone();
let cameraDistance = initialDistance;

export function TankopediaControls() {
  const canvas = useThree((state) => state.gl.domElement);
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      clientPosition.set(event.clientX, event.clientY);

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
      workingVector2.set(event.clientX, event.clientY).sub(clientPosition);

      workingVector2.x *= -(2 * Math.PI) / canvas.width;
      workingVector2.y *= (2 * Math.PI) / canvas.height;

      cameraRotation.x += workingVector2.x;

      if (cameraRotation.y + workingVector2.y < Math.PI / 2) {
        cameraRotation.y += workingVector2.y;
      }

      clientPosition.set(event.clientX, event.clientY);

      updateCameraPosition();
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    function updateCameraPosition() {
      camera.position
        .set(cameraDistance, 0, 0)
        .applyAxisAngle(J_HAT, cameraRotation.x)
        .applyAxisAngle(K_HAT, cameraRotation.y)
        .add(cameraCenter);
      camera.lookAt(cameraCenter);

      invalidate();
    }

    canvas.addEventListener("pointerdown", handlePointerDown);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);
}
