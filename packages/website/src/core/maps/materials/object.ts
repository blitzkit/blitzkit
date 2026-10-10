import {
  DoubleSide,
  FrontSide,
  RepeatWrapping,
  ShaderMaterial,
  Vector2,
  Vector4,
  type MeshStandardMaterial,
} from "three";
import type { MapMaterialExtras, MapWind } from "../extras";
import { mapTime, slotTexture } from "./common";
import {
  shadowFragment,
  shadowFragmentPars,
  shadowUniforms,
  shadowVertex,
  shadowVertexPars,
} from "./shadow";

export function createObjectMaterial(
  source: MeshStandardMaterial,
  extras: MapMaterialExtras,
  billboard: boolean,
  vertexColors: boolean,
  wind: MapWind | undefined,
) {
  const shift = extras.textureShift ?? [0, 0];
  const shiftPerSecond = extras.textureShiftPerSecond ?? [0, 0];
  const flatColor = extras.flatColor ?? [1, 1, 1, 1];
  const flatAlbedo = extras.flatAlbedo ?? [1, 1, 1, 1];
  const blendByAngle = extras.blendByAngle ?? {
    bounds: [0, 1],
    power: 1,
    inversion: 0,
  };

  const receiveShadow = !!extras.shadowReceiver && !billboard;
  const detail = extras.detailScale ? slotTexture(source, "detail") : null;

  if (detail) {
    detail.wrapS = RepeatWrapping;
    detail.wrapT = RepeatWrapping;
  }

  const material = new ShaderMaterial({
    lights: receiveShadow,
    side: extras.doubleSided ? DoubleSide : FrontSide,
    transparent: !!extras.alphaBlend,
    depthWrite: extras.depthWrite ?? !extras.alphaBlend,
    vertexColors,
    defines: {
      ...(extras.lightmap && { USE_UV1: "", LIGHTMAP: "" }),
      ...(billboard && { BILLBOARD: "" }),
      ...(wind && { WIND: "" }),
      ...(vertexColors && { VERTEX_COLOR: "" }),
      ...(extras.alphaBlend && { ALPHA_BLEND: "" }),
      ...(extras.alphaStep !== undefined && { ALPHA_STEP: "" }),
      ...(extras.blendByAngle && { BLEND_BY_ANGLE: "" }),
      ...(receiveShadow && { RECEIVE_SHADOW: "" }),
      ...(detail && { DETAIL: "" }),
    },
    uniforms: {
      albedo: { value: slotTexture(source, "albedo") },
      detail: { value: detail },
      detailScale: { value: new Vector2(...(extras.detailScale ?? [1, 1])) },
      lightmap: {
        value: extras.lightmap ? slotTexture(source, "lightmap") : null,
      },
      alphaTest: { value: extras.alphaTest ?? 0 },
      alphaStep: { value: extras.alphaStep ?? 0 },
      flatColor: { value: new Vector4(...flatColor) },
      flatAlbedo: { value: new Vector4(...flatAlbedo) },
      textureShift: { value: new Vector2(...shift) },
      textureShiftPerSecond: { value: new Vector2(...shiftPerSecond) },
      time: mapTime,
      leafSpeed: { value: wind?.leafSpeed ?? 0 },
      leafAmplitude: { value: ((wind?.leafAmplitude ?? 0) * Math.PI) / 180 },
      trunkAmplitude: { value: wind?.trunkAmplitude ?? 0 },
      trunkFrequency: { value: Math.sqrt(wind?.trunkSpring ?? 0) },
      angleBlendBounds: { value: new Vector2(...blendByAngle.bounds) },
      angleBlendPower: { value: blendByAngle.power },
      angleBlendInversion: { value: blendByAngle.inversion },
      ...shadowUniforms(receiveShadow),
    },
    vertexShader: /* glsl */ `
      #ifdef BILLBOARD
        attribute vec4 _pivot;
      #endif

      #ifdef WIND
        attribute float _flexibility;
        attribute vec2 _angle_sin_cos;
        uniform float leafSpeed;
        uniform float leafAmplitude;
        uniform float trunkAmplitude;
        uniform float trunkFrequency;
      #endif

      #include <batching_pars_vertex>
      #include <skinning_pars_vertex>
      ${shadowVertexPars}

      uniform vec2 textureShift;
      uniform vec2 textureShiftPerSecond;
      uniform float time;
      varying vec2 vUv;
      varying vec2 vUv1;
      varying vec3 vColor;
      varying vec3 vViewNormal;
      varying vec3 vViewPosition;
      varying float vFade;

      void main() {
        #include <batching_vertex>

        #ifdef USE_BATCHING
          mat4 instanceModel = modelMatrix * batchingMatrix;
        #else
          mat4 instanceModel = modelMatrix;
        #endif

        #ifdef USE_BATCHING_COLOR
          vFade = getBatchingColor(getIndirectIndex(gl_DrawID)).r;
        #else
          vFade = 1.0;
        #endif

        mat4 instanceModelView = viewMatrix * instanceModel;
        mat3 instanceNormalMatrix = mat3(instanceModelView);
        vec3 transformed = position;
        vec3 objectNormal = normal;

        #ifdef USE_SKINNING
          #include <skinbase_vertex>
          #include <skinnormal_vertex>
          #include <skinning_vertex>
        #endif

        vUv = uv + textureShift + fract(textureShiftPerSecond * time);

        #ifdef LIGHTMAP
          vUv1 = uv1;
        #endif

        #ifdef VERTEX_COLOR
          vColor = color;
        #endif

        #ifdef BILLBOARD
          vec3 pivot = mix(position, _pivot.xyz, _pivot.w);
          vec2 offset = (position - pivot).xy;

          #ifdef WIND
            float phase = (instanceModel[3].x + instanceModel[3].y) * 0.1;
            float leafAngle = time * leafSpeed + phase;
            vec2 leafOscillationParams = leafAmplitude * vec2(sin(leafAngle), cos(leafAngle));
            float trunkSway = trunkAmplitude * sin(time * trunkFrequency + phase);
            vec2 trunkOscillationParams = vec2(trunkSway, trunkSway * 0.5);

            pivot.xy += trunkOscillationParams * _flexibility;

            vec2 sinCos = _angle_sin_cos * leafOscillationParams;
            float sinT = sinCos.x + sinCos.y;
            float cosT = 1.0 - 0.5 * sinT * sinT;

            offset = vec2(offset.x * cosT - offset.y * sinT, offset.x * sinT + offset.y * cosT);
          #endif

          vec4 mvPosition = instanceModelView * vec4(pivot, 1.0);

          mvPosition.xy += offset * length(instanceModel[0].xyz);
        #else
          vec4 mvPosition = instanceModelView * vec4(transformed, 1.0);
        #endif

        #ifdef BLEND_BY_ANGLE
          vViewNormal = instanceNormalMatrix * objectNormal;
          vViewPosition = mvPosition.xyz;
        #endif

        ${shadowVertex(
          "transformed",
          "objectNormal",
          "instanceModel",
          "instanceNormalMatrix",
        )}

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D albedo;
      uniform sampler2D lightmap;
      uniform sampler2D detail;
      uniform vec2 detailScale;
      uniform float alphaTest;
      uniform float alphaStep;
      uniform vec4 flatColor;
      uniform vec4 flatAlbedo;
      varying float vFade;
      varying vec2 vUv;
      varying vec2 vUv1;
      varying vec3 vColor;
      varying vec3 vViewNormal;
      varying vec3 vViewPosition;
      uniform vec2 angleBlendBounds;
      uniform float angleBlendPower;
      uniform float angleBlendInversion;
      ${shadowFragmentPars}

      void main() {
        vec4 color = texture2D(albedo, vUv);

        color *= flatAlbedo;

        if (color.a < alphaTest) discard;

        #ifdef ALPHA_STEP
          color.a = step(alphaStep, color.a);
        #endif

        if (vFade < 1.0) {
          float dither = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));

          if (dither > vFade) discard;
        }

        #ifdef VERTEX_COLOR
          color.rgb *= vColor;
        #endif

        #ifdef LIGHTMAP
          color.rgb *= texture2D(lightmap, vUv1).rgb * 2.0;
        #endif

        #ifdef DETAIL
          color.rgb *= texture2D(detail, vUv * detailScale).rgb * 2.0;
        #endif

        color *= flatColor;

        ${shadowFragment}

        #ifdef BLEND_BY_ANGLE
          float viewDotNormal = abs(dot(vViewPosition, vViewNormal)) / (length(vViewPosition) * length(vViewNormal));

          viewDotNormal = mix(viewDotNormal, 1.0 - viewDotNormal, angleBlendInversion);
          color.a *= pow(
            clamp((viewDotNormal - angleBlendBounds.x) / (angleBlendBounds.y - angleBlendBounds.x), 0.0, 1.0),
            angleBlendPower
          );
        #endif

        #ifdef ALPHA_BLEND
          gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), color.a);
        #else
          gl_FragColor = vec4(clamp(color.rgb, 0.0, 1.0), 1.0);
        #endif
      }
    `,
  });

  material.userData.batchable = true;

  return material;
}
