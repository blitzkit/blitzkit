import { I_HAT, J_HAT } from "@blitzkit/core";
import { invalidate, useThree } from "@react-three/fiber";
import { Quicklime } from "quicklime";
import { useEffect } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { clamp, degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { awaitableModelDefinitions } from "../../../../../../core/awaitables/modelDefinitions";
import { MAX_ZOOM_DISTANCE } from "./SceneProps";

export interface ZoomEventData {
  distance: number;
  fov: number;
}

export const zoomEvent = new Quicklime<ZoomEventData>();

const modelDefinitions = await awaitableModelDefinitions;
const initialPosition = new Vector3(-8, 2, -13);
const minL = 5;
const maxL = MAX_ZOOM_DISTANCE;

const temp = new Vector3();

interface ControlsProps {}

export function Controls({}: ControlsProps) {
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);

  const height = 3;
  const padding = 5;
  const center = new Vector3(0, height / 2, 0);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    camera.position.copy(initialPosition);
    scroll(0);

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      scroll(event.deltaY);
    }

    function scroll(deltaY: number) {
      const distance0 = temp.copy(camera.position).sub(center).length();
      const x = (distance0 - minL) / (maxL - minL);
      const scrollSpeed = 2 ** 8 * x + 1;
      const deltaDistance = (deltaY / window.innerHeight) * scrollSpeed;

      const distance = clamp(distance0 + deltaDistance, minL, maxL);

      const fov = Math.atan2(height / 2 + padding, distance);
      const dFov = fov - degToRad((camera as PerspectiveCamera).fov);

      camera.position
        .sub(center)
        .normalize()
        .multiplyScalar(distance)
        .add(center);
      camera.lookAt(center);

      (camera as PerspectiveCamera).fov += radToDeg(dFov);
      camera.updateProjectionMatrix();

      invalidate();
    }

    function handlePointerDown() {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      const dx = event.movementX / window.innerWidth;
      const dy = event.movementY / window.innerHeight;

      camera.position
        .sub(center)
        .applyAxisAngle(J_HAT, -Math.PI * dx)
        .applyAxisAngle(I_HAT, Math.PI * dy)
        .add(center);
      camera.lookAt(center);

      invalidate();
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("pointerdown", handlePointerDown);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [canvas]);

  return null;
}
