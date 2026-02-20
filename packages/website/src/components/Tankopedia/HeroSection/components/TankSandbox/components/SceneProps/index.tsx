import { invalidate, useFrame } from "@react-three/fiber";
import { clamp } from "lodash-es";
import { Quicklime, type QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import { BackSide, Mesh, MeshStandardMaterial } from "three";

export const MAX_ZOOM_DISTANCE = 720;
const PLANE_SIZE = MAX_ZOOM_DISTANCE;
const CYLINDER_RADIUS = 5;
const CYLINDER_FACES = 5;

const material = new MeshStandardMaterial({
  color: "black",
  roughness: 1,
  metalness: 0,
  side: BackSide,
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
    <group
      position={[0, 0, CYLINDER_RADIUS]}
      ref={wrapper}
      visible={!screenshotReadyEvent.last!}
    >
      <mesh
        position={[0, 0, -(PLANE_SIZE - CYLINDER_RADIUS) / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
        material={material}
      >
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE - CYLINDER_RADIUS]} />
      </mesh>

      <mesh
        position={[0, PLANE_SIZE / 2 + CYLINDER_RADIUS / 2, CYLINDER_RADIUS]}
        rotation={[Math.PI, Math.PI, 0]}
        receiveShadow
        material={material}
      >
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE - CYLINDER_RADIUS]} />
      </mesh>

      <mesh
        position={[0, CYLINDER_RADIUS, 0]}
        rotation={[0, 0, -Math.PI / 2]}
        receiveShadow
        material={material}
      >
        <cylinderGeometry
          args={[
            CYLINDER_RADIUS,
            CYLINDER_RADIUS,
            PLANE_SIZE,
            CYLINDER_FACES,
            1,
            true,
            0,
            Math.PI / 2,
          ]}
        />
      </mesh>
    </group>
  );
}
