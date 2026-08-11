import { mauveDark } from "@radix-ui/colors";
import { invalidate } from "@react-three/fiber";
import { Quicklime, type QuicklimeEvent } from "quicklime";
import { useCallback, useEffect, useRef } from "react";
import { Mesh, type WebGLProgramParametersWithUniforms } from "three";

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

  const handleBeforeCompile = useCallback(
    (shader: WebGLProgramParametersWithUniforms) => {
      shader.uniforms.size = { value: SIZE / 2 };

      shader.vertexShader = `
        varying vec3 vWorldPosition;

        ${shader.vertexShader}
      `.replace(
        "#include <worldpos_vertex>",

        `
          #include <worldpos_vertex>
          vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
        `,
      );

      shader.fragmentShader = `
        varying vec3 vWorldPosition;
        uniform float size;

        ${shader.fragmentShader}
      `.replace(
        "#include <color_fragment>",

        `
          #include <color_fragment>

          vec3 scaled = vWorldPosition / size;
          float radius = length(scaled.xz);

          if (radius >= 1.0) {
            discard;
          }

          diffuseColor.a *= (1.0 - radius);
        `,
      );
    },
    [],
  );

  return (
    <mesh
      position={[0, -(2 ** -8), 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      visible={!screenshotReadyEvent.last!}
      ref={mesh}
      receiveShadow
    >
      <planeGeometry args={[SIZE, SIZE]} />
      <meshStandardMaterial
        color={mauveDark.mauve6}
        roughness={1}
        transparent
        onBeforeCompile={handleBeforeCompile}
      />
    </mesh>
  );
}
