import { invalidate, useFrame } from "@react-three/fiber";
import { clamp } from "lodash-es";
import { Quicklime, type QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";

const SIZE = 2 ** 5;

export const screenshotReadyEvent = new Quicklime(false);

export function SceneProps() {
  const mesh = useRef<Mesh>(null!);
  const material = useRef<MeshStandardMaterial>(null);

  useFrame(({ camera }) => {
    if (!material.current) return;
    material.current.opacity = clamp(0.5 * camera.position.y, 0, 1);
  });

  useEffect(() => {
    function handleScreenshotReady(event: QuicklimeEvent<boolean>) {
      mesh.current.visible = !event.data;
      invalidate();
    }

    screenshotReadyEvent.on(handleScreenshotReady);

    return () => {
      screenshotReadyEvent.off(handleScreenshotReady);
    };
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      visible={!screenshotReadyEvent.last!}
      ref={mesh}
    >
      <planeGeometry args={[SIZE, SIZE]} />
      <meshStandardMaterial
        transparent
        ref={material}
        color="black"
        roughness={1}
        metalness={1}
      />
    </mesh>
  );
}
