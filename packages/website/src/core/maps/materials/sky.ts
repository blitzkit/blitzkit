import { DoubleSide, ShaderMaterial, type MeshStandardMaterial } from "three";
import type { MapMaterialExtras } from "../extras";
import { mapTime, slotTexture } from "./common";

export function createSkyMaterial(
  source: MeshStandardMaterial,
  extras: MapMaterialExtras,
) {
  return new ShaderMaterial({
    side: DoubleSide,
    depthWrite: false,
    defines: extras.flow ? { FLOWMAP: "" } : {},
    uniforms: {
      albedo: { value: slotTexture(source, "albedo") },
      flowmap: { value: extras.flow ? slotTexture(source, "flowmap") : null },
      flowAnimSpeed: { value: extras.flow?.speed ?? 0 },
      flowAnimOffset: { value: extras.flow?.offset ?? 0 },
      time: mapTime,
    },
    vertexShader: /* glsl */ `
      uniform float flowAnimSpeed;
      uniform float flowAnimOffset;
      uniform float time;
      varying vec2 vUv;
      varying vec3 vFlowData;

      void main() {
        vUv = uv;

        #ifdef FLOWMAP
          float scaledTime = time * flowAnimSpeed;
          vec2 flowPhases = fract(vec2(scaledTime, scaledTime + 0.5)) - vec2(0.5);

          vFlowData = vec3(flowPhases * flowAnimOffset, abs(flowPhases.x * 2.0));
        #endif

        vec4 position4 = projectionMatrix * modelViewMatrix * vec4(position, 0.0);

        gl_Position = vec4(position4.xy, position4.w - 0.0001, position4.w);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D albedo;
      uniform sampler2D flowmap;
      varying vec2 vUv;
      varying vec3 vFlowData;

      void main() {
        #ifdef FLOWMAP
          vec2 flowDirection = texture2D(flowmap, vUv).xy * 2.0 - 1.0;
          vec3 sample1 = texture2D(albedo, vUv + flowDirection * vFlowData.x).rgb;
          vec3 sample2 = texture2D(albedo, vUv + flowDirection * vFlowData.y).rgb;
          vec3 color = mix(sample1, sample2, vFlowData.z);
        #else
          vec3 color = texture2D(albedo, vUv).rgb;
        #endif

        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}
