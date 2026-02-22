import { I_HAT, J_HAT } from "@blitzkit/core";
import { invalidate, useThree } from "@react-three/fiber";
import { Quicklime } from "quicklime";
import { useEffect } from "react";
import { PerspectiveCamera, Quaternion, Vector3 } from "three";
import { clamp, degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { awaitableModelDefinitions } from "../../../../../../core/awaitables/modelDefinitions";
import { Tankopedia } from "../../../../../../stores/tankopedia";
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

const tempVector = new Vector3();
const tempQuaternion = new Quaternion();

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
      const distance0 = tempVector.copy(camera.position).sub(center).length();
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

      (camera as PerspectiveCamera).fov += radToDeg(dFov);
      camera.updateProjectionMatrix();

      if (!Tankopedia.state.disturbed) {
        Tankopedia.mutate((draft) => {
          draft.disturbed = true;
        });
      }

      invalidate();
    }

    function handlePointerDown() {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    function handlePointerMove(event: PointerEvent) {
      event.preventDefault();

      tempVector.copy(camera.position).sub(center);

      const r = tempVector.length();
      const dx = event.movementX / window.innerWidth;
      const dy = event.movementY / window.innerHeight;

      const dTheta = -dx * Math.PI;
      const dPhi = -dy * Math.PI;

      const theta = Math.atan2(tempVector.x, tempVector.z) + dTheta;
      const phi0 = Math.acos(tempVector.y / r);
      let phi = phi0 + dPhi;

      if (phi < 0 || phi > Math.PI) phi = phi0;

      tempVector
        .set(
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.cos(theta),
        )
        .multiplyScalar(r);
      camera.position.copy(center).add(tempVector);

      tempQuaternion.setFromAxisAngle(I_HAT, phi - Math.PI / 2);
      camera.quaternion.setFromAxisAngle(J_HAT, theta).multiply(tempQuaternion);

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
