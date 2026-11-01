import {
  DoubleSide,
  ShaderMaterial,
  Vector4,
  type MeshStandardMaterial,
} from "three";
import type { MapMaterialExtras } from "../extras";
import { slotTexture } from "./common";
import {
  shadowFragment,
  shadowFragmentPars,
  shadowUniforms,
  shadowVertex,
  shadowVertexPars,
} from "./shadow";

export function createGrassMaterial(
  source: MeshStandardMaterial,
  extras: MapMaterialExtras,
) {
  const receiveShadow = !!extras.shadowReceiver;
  const color = slotTexture(source, "grassColor");
  const density = slotTexture(source, "grassDensity");

  return new ShaderMaterial({
    side: DoubleSide,
    lights: receiveShadow,
    defines: {
      ...(color && { LIGHTMAP: "" }),
      ...(density && { DENSITY_SCALE: "" }),
      ...(receiveShadow && { RECEIVE_SHADOW: "" }),
    },
    uniforms: {
      ...shadowUniforms(receiveShadow),
      albedo: { value: slotTexture(source, "albedo") },
      lightmap: { value: color },
      densityScale: { value: density },
      baseColorMultiplier: { value: extras.baseColorMultiplier ?? 1 },
      visibilityDistance: { value: extras.visibilityDistance ?? 50 },
      mapBounds: {
        value: new Vector4(...(extras.mapBounds ?? [-300, -300, 300, 300])),
      },
    },
    vertexShader: /* glsl */ `
      uniform vec4 mapBounds;
      uniform float visibilityDistance;
      uniform sampler2D lightmap;
      uniform sampler2D densityScale;
      varying vec2 vUv;
      varying vec3 vVegetationColor;
      varying float vVisible;
      ${shadowVertexPars}

      void main() {
        vUv = uv;

        #ifdef USE_INSTANCING
          mat4 instanceModel = modelMatrix * instanceMatrix;
        #else
          mat4 instanceModel = modelMatrix;
        #endif

        vec4 world = instanceModel * vec4(position, 1.0);
        vec3 pivot = instanceModel[3].xyz;
        vec2 mapPivot = vec2(pivot.x, -pivot.z);
        vec2 colorUv = vec2(
          (mapPivot.x - mapBounds.x) / (mapBounds.z - mapBounds.x),
          1.0 - (mapPivot.y - mapBounds.y) / (mapBounds.w - mapBounds.y)
        );

        #ifdef LIGHTMAP
          vVegetationColor = texture2D(lightmap, colorUv).rgb;
        #else
          vVegetationColor = vec3(1.0);
        #endif

        float scale = 1.0;

        #ifdef DENSITY_SCALE
          scale = texture2D(densityScale, colorUv).r;
          world.xyz = mix(pivot, world.xyz, scale);
        #endif

        vVisible = step(distance(world.xyz, cameraPosition), visibilityDistance);
        gl_Position = projectionMatrix * viewMatrix * world;

        if (scale <= 0.001) gl_Position = vec4(0.0, 0.0, 2.0, 1.0);

        ${shadowVertex(
          "world.xyz",
          "vec3(0.0, 1.0, 0.0)",
          "mat4(1.0)",
          "mat3(viewMatrix)",
        )}
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D albedo;
      uniform float baseColorMultiplier;
      varying vec2 vUv;
      varying vec3 vVegetationColor;
      varying float vVisible;
      ${shadowFragmentPars}

      void main() {
        vec4 color = texture2D(albedo, vUv);

        if (vVisible < 0.5 || color.a < 0.5) discard;

        #ifdef LIGHTMAP
          color.rgb *= vVegetationColor * baseColorMultiplier;
        #endif

        ${shadowFragment}

        gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), 1.0);
      }
    `,
  });
}
