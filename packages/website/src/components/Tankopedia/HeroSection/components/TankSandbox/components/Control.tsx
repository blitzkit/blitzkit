import { invalidate, useThree } from "@react-three/fiber";
import { Quicklime } from "quicklime";
import { useEffect } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { clamp, radToDeg } from "three/src/math/MathUtils.js";
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

interface ControlsProps {}

export function Controls({}: ControlsProps) {
  const camera = useThree((state) => state.camera);
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;

    const height = 3;
    const padding = 4;
    const center = new Vector3(0, height / 2, 0);
    const temp = new Vector3();

    camera.position.copy(initialPosition);
    camera.lookAt(center);

    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();

      const distance0 = temp.copy(camera.position).sub(center).length();
      const x = (distance0 - minL) / (maxL - minL);
      const scrollSpeed = 6 * x + 1;
      const deltaDistance = event.deltaY * (scrollSpeed / 10);

      const distance = clamp(distance0 + deltaDistance, minL, maxL);
      const fov = Math.atan2(height / 2 + padding, distance);

      camera.position
        .sub(center)
        .normalize()
        .multiplyScalar(distance)
        .add(center);

      camera.lookAt(center);

      (camera as PerspectiveCamera).fov = radToDeg(fov);
      camera.updateProjectionMatrix();

      invalidate();
      zoomEvent.dispatch({ distance, fov });
    });
  }, [canvas]);

  return null;
}
