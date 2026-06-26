import { invalidate } from "@react-three/fiber";
import { Quicklime, type QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";

const SIZE = 14;

export const screenshotReadyEvent = new Quicklime(false);

export function SceneProps() {
  const mesh = useRef<Mesh>(null!);
  const material = useRef<MeshStandardMaterial>(null);

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
        ref={material}
        color="black"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
