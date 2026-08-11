import { mauveDark } from "@radix-ui/colors";
import { invalidate } from "@react-three/fiber";
import { Quicklime, type QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import { Color, Mesh } from "three";
import fragmentShader from "./shaders/fragment.glsl?raw";
import vertexShader from "./shaders/vertex.glsl?raw";

const SIZE = 2 ** 4;

export const screenshotReadyEvent = new Quicklime(false);

export function SceneProps() {
  const mesh = useRef<Mesh>(null!);

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
      position={[0, -(2 ** -8), 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={!screenshotReadyEvent.last!}
      ref={mesh}
    >
      <planeGeometry args={[SIZE, SIZE]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent
        uniforms={{
          size: { value: SIZE / 2 },
          color: { value: new Color(mauveDark.mauve8) },
        }}
      />
    </mesh>
  );
}
