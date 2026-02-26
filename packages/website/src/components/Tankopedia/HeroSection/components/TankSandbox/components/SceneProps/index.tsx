import { invalidate, useFrame } from "@react-three/fiber";
import { clamp } from "lodash-es";
import { Quicklime, type QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";

export const MIN_ZOOM_DISTANCE = 5;
export const MAX_ZOOM_DISTANCE = 720;
const PLANE_SIZE = MAX_ZOOM_DISTANCE * 2;

const material = new MeshStandardMaterial({
  color: "black",
  roughness: 1,
  metalness: 1,
  transparent: true,
});

export const screenshotReadyEvent = new Quicklime(false);

export function SceneProps() {
  const wrapper = useRef<Mesh>(null!);

  useFrame(({ camera }) => {
    material.opacity = clamp(0.5 * camera.position.y, 0, 1);
  });

  useEffect(() => {
    function handleScreenshotReady(event: QuicklimeEvent<boolean>) {
      wrapper.current.visible = !event.data;
      invalidate();
    }

    screenshotReadyEvent.on(handleScreenshotReady);

    return () => {
      screenshotReadyEvent.off(handleScreenshotReady);
    };
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={material}>
      <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
    </mesh>
  );
}
