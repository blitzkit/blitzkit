import { invalidate, useFrame, useThree } from "@react-three/fiber";
import { Quicklime } from "quicklime";
import { useEffect } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { clamp, degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { awaitableModelDefinitions } from "../../../../../../core/awaitables/modelDefinitions";

export interface ZoomEventData {
  distance: number;
  fov: number;
}

export const zoomEvent = new Quicklime<ZoomEventData>();

const modelDefinitions = await awaitableModelDefinitions;
const initialPosition = new Vector3(-8, 2, -13);
const minL = 5;
const maxL = 720;

const temp = new Vector3();

interface ControlsProps {}

export function Controls({}: ControlsProps) {
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);

  const height = 3;
  const padding = 4;
  const center = new Vector3(0, height / 2, 0);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    camera.position.copy(initialPosition);
    camera.lookAt(center);

    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();

      const distance0 = temp.copy(camera.position).sub(center).length();
      const x = (distance0 - minL) / (maxL - minL);
      const scrollSpeed = (6 * x + 1) / 10;
      const deltaDistance = event.deltaY * scrollSpeed;

      const distance = clamp(distance0 + deltaDistance, minL, maxL);

      camera.position
        .sub(center)
        .normalize()
        .multiplyScalar(distance)
        .add(center);

      camera.lookAt(center);

      invalidate();
    });
  }, [canvas]);

  useFrame(({ clock }) => {
    const distance = temp.copy(camera.position).sub(center).length();
    const fov = Math.atan2(height / 2 + padding, distance);
    const dFov = fov - degToRad((camera as PerspectiveCamera).fov);

    (camera as PerspectiveCamera).fov += radToDeg(dFov / 50);
    camera.updateProjectionMatrix();

    invalidate();
  });

  return null;
}
