import { ShaderMaterial, UniformsLib, UniformsUtils } from "three";
import type { MapMaterialExtras } from "../extras";
import { SHADOW_COLOR } from "./common";

export const shadowVertexPars = /* glsl */ `
  #ifdef RECEIVE_SHADOW
    #include <common>
    #include <shadowmap_pars_vertex>
  #endif
`;

export const shadowFragmentPars = /* glsl */ `
  #ifdef RECEIVE_SHADOW
    #include <common>
    #include <packing>
    #include <lights_pars_begin>
    #include <shadowmap_pars_fragment>
    #include <shadowmask_pars_fragment>

    uniform vec3 shadowColor;
  #endif
`;

export function shadowVertex(
  position: string,
  normal: string,
  model = "modelMatrix",
  normalTransform = "normalMatrix",
) {
  return /* glsl */ `
    #ifdef RECEIVE_SHADOW
      vec4 worldPosition = ${model} * vec4(${position}, 1.0);
      vec3 transformedNormal = ${normalTransform} * ${normal};

      #include <shadowmap_vertex>
    #endif
  `;
}

export const shadowFragment = /* glsl */ `
  #ifdef RECEIVE_SHADOW
    color.rgb *= mix(shadowColor, vec3(1.0), getShadowMask());
  #endif
`;

export function shadowUniforms(receive: boolean) {
  return receive
    ? {
        ...UniformsUtils.clone(UniformsLib.lights),
        shadowColor: { value: SHADOW_COLOR },
      }
    : {};
}

export function createShadowDepthMaterial(
  material: ShaderMaterial,
  extras: MapMaterialExtras,
) {
  const { RECEIVE_SHADOW, ALPHA_BLEND, ...defines } = material.defines;

  return new ShaderMaterial({
    side: material.side,
    vertexColors: material.vertexColors,
    defines,
    uniforms: {
      ...material.uniforms,
      shadowAlphaTest: { value: extras.alphaTest || 0.5 },
    },
    vertexShader: material.vertexShader,
    fragmentShader: /* glsl */ `
      #include <packing>

      uniform sampler2D albedo;
      uniform vec4 flatAlbedo;
      uniform float shadowAlphaTest;
      varying vec2 vUv;

      void main() {
        if ((texture2D(albedo, vUv) * flatAlbedo).a < shadowAlphaTest) discard;

        gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
      }
    `,
  });
}
