import {
  LessDepth,
  Matrix4,
  RepeatWrapping,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  type MeshStandardMaterial,
} from "three";
import type { MapMaterialExtras } from "../extras";
import { mapTime, slotTexture, SUN_DIRECTION } from "./common";
import {
  shadowFragment,
  shadowFragmentPars,
  shadowUniforms,
  shadowVertex,
  shadowVertexPars,
} from "./shadow";

export function createWaterMaterial(
  source: MeshStandardMaterial,
  extras: MapMaterialExtras,
  hasTangent: boolean,
) {
  const normalmap = slotTexture(source, "waterNormal")!;

  normalmap.wrapS = RepeatWrapping;
  normalmap.wrapT = RepeatWrapping;

  const receiveShadow = !!extras.shadowReceiver;

  const material = new ShaderMaterial({
    transparent: true,
    depthFunc: LessDepth,
    lights: receiveShadow,
    defines: {
      ...(extras.renderObject && { RENDER_OBJECT: "" }),
      ...(!extras.renderObject && hasTangent && { MESH_TANGENT: "" }),
      ...(extras.specular && { SPECULAR: "" }),
      ...(receiveShadow && { RECEIVE_SHADOW: "" }),
    },
    uniforms: {
      ...shadowUniforms(receiveShadow),
      ...(receiveShadow && {
        shadowColor: {
          value: new Vector3(...(extras.shadowTint ?? [0.9, 0.9, 0.9])),
        },
      }),
      normalmap: { value: normalmap },
      reflectionMap: { value: null },
      reflectionMatrix: { value: new Matrix4() },
      refractionMap: { value: null },
      refractionDepth: { value: null },
      refractionCamera: { value: new Vector2(1, 1000) },
      refractionDistortion: { value: extras.refractionDistortion ?? 0 },
      refractionTint: {
        value: new Vector3(...(extras.refractionTint ?? [1, 1, 1])),
      },
      sunDirection: { value: SUN_DIRECTION },
      time: mapTime,
      normal0Scale: { value: extras.normal0Scale ?? 1 },
      normal1Scale: { value: extras.normal1Scale ?? 1 },
      normal0ShiftPerSecond: {
        value: new Vector2(...(extras.normal0ShiftPerSecond ?? [0, 0])),
      },
      normal1ShiftPerSecond: {
        value: new Vector2(...(extras.normal1ShiftPerSecond ?? [0, 0])),
      },
      texCoordTransform: {
        value: new Vector4(...(extras.texCoordTransform ?? [1, 0, 0, 1])),
      },
      inputTangent: { value: new Vector3(...(extras.tangent ?? [1, 0, 0])) },
      fresnelBias: { value: extras.fresnelBias ?? 0 },
      fresnelPower: { value: extras.fresnelPower ?? 0 },
      reflectionTint: {
        value: new Vector3(...(extras.reflectionTint ?? [1, 1, 1])),
      },
      reflectionDistortion: { value: extras.reflectionDistortion ?? 0 },
      distortionFallSquareDist: { value: extras.distortionFallSquareDist ?? 1 },
      glossiness: { value: extras.specular?.glossiness ?? 0.5 },
      specularity: { value: extras.specular?.specularity ?? 0.5 },
    },
    vertexShader: /* glsl */ `
      #ifdef MESH_TANGENT
        attribute vec3 _tangent;
      #endif

      uniform float time;
      uniform float normal0Scale;
      uniform float normal1Scale;
      uniform vec2 normal0ShiftPerSecond;
      uniform vec2 normal1ShiftPerSecond;
      uniform vec4 texCoordTransform;
      uniform vec3 inputTangent;
      uniform vec3 sunDirection;
      uniform mat4 reflectionMatrix;
      varying vec2 vTexCoord0;
      varying vec2 vTexCoord1;
      varying vec3 vCameraToPoint;
      varying vec3 vEyePosition;
      varying vec3 vLightVec;
      varying vec4 vReflectionCoord;
      varying vec4 vProjectedPosition;
      varying float vViewDepth;
      ${shadowVertexPars}

      vec3 toMapSpace(vec3 direction) {
        return vec3(direction.x, -direction.z, direction.y);
      }

      void main() {
        #ifdef RENDER_OBJECT
          vec3 inNormal = vec3(0.0, 0.0, 1.0);
          vec3 inTangent = inputTangent;
          vec2 texCoord = vec2(
            dot(position.xy, texCoordTransform.xz),
            dot(position.xy, texCoordTransform.yw)
          );
        #else
          vec3 inNormal = normal;
          #ifdef MESH_TANGENT
            vec3 inTangent = _tangent;
          #else
            vec3 inTangent = inputTangent;
          #endif
          vec2 texCoord = uv;
        #endif

        vTexCoord0 = texCoord * normal0Scale + fract(normal0ShiftPerSecond * time);
        vTexCoord1 =
          vec2(texCoord.x + texCoord.y, texCoord.y - texCoord.x) * normal1Scale +
          fract(normal1ShiftPerSecond * time);

        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vec3 n = normalize(toMapSpace(mat3(modelMatrix) * inNormal));
        vec3 t = normalize(toMapSpace(mat3(modelMatrix) * inTangent));
        vec3 b = cross(n, t);
        vec3 cameraToPoint = toMapSpace(worldPosition.xyz - cameraPosition);

        vCameraToPoint = vec3(dot(cameraToPoint, t), dot(cameraToPoint, b), dot(cameraToPoint, n));
        vEyePosition = cameraToPoint;
        vLightVec = vec3(dot(sunDirection, t), dot(sunDirection, b), dot(sunDirection, n));
        vReflectionCoord = reflectionMatrix * worldPosition;

        vec4 viewPosition = viewMatrix * worldPosition;

        vViewDepth = -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
        vProjectedPosition = gl_Position;

        {
          ${shadowVertex("position", "inNormal")}
        }
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D normalmap;
      uniform sampler2D reflectionMap;
      uniform float fresnelBias;
      uniform float fresnelPower;
      uniform vec3 reflectionTint;
      uniform float reflectionDistortion;
      uniform float distortionFallSquareDist;
      uniform float glossiness;
      uniform float specularity;
      varying vec2 vTexCoord0;
      varying vec2 vTexCoord1;
      varying vec3 vCameraToPoint;
      varying vec3 vEyePosition;
      varying vec3 vLightVec;
      varying vec4 vReflectionCoord;
      varying vec4 vProjectedPosition;
      varying float vViewDepth;
      ${shadowFragmentPars}

      #ifdef COASTLINE
        uniform sampler2D refractionMap;
        uniform sampler2D refractionDepth;
        uniform vec2 refractionCamera;
        uniform float refractionDistortion;
        uniform vec3 refractionTint;

        float sceneDistanceAt(ivec2 texel, ivec2 size) {
          float depth = texelFetch(refractionDepth, clamp(texel, ivec2(0), size - 1), 0).r;
          float near = refractionCamera.x;
          float far = refractionCamera.y;

          return near * far / (far - depth * (far - near));
        }

        float sampleSceneDistance(vec2 uv) {
          ivec2 size = textureSize(refractionDepth, 0);
          vec2 position = uv * vec2(size) - 0.5;
          ivec2 base = ivec2(floor(position));
          vec2 weight = fract(position);

          return mix(
            mix(sceneDistanceAt(base, size), sceneDistanceAt(base + ivec2(1, 0), size), weight.x),
            mix(
              sceneDistanceAt(base + ivec2(0, 1), size),
              sceneDistanceAt(base + ivec2(1, 1), size),
              weight.x
            ),
            weight.y
          );
        }
      #endif

      void main() {
        vec3 normal0 = texture2D(normalmap, vTexCoord0).rgb;
        vec3 normal1 = texture2D(normalmap, vTexCoord1).rgb;
        vec3 normal = normalize(normal0 + normal1 - 1.0);
        vec3 cameraToPoint = normalize(vCameraToPoint);
        float lambert = max(dot(-cameraToPoint, normal), 0.0);
        float fresnel = fresnelBias + (1.0 - fresnelBias) * pow(1.0 - lambert, fresnelPower);
        vec2 waveOffset =
          normal.xy * max(0.1, 1.0 - dot(vEyePosition, vEyePosition) * distortionFallSquareDist);

        #ifdef COASTLINE
          vec2 screenUv = vProjectedPosition.xy / vProjectedPosition.w * 0.5 + 0.5;
          float sceneDistance = sampleSceneDistance(screenUv);
          float projectedDepth = vProjectedPosition.z / vProjectedPosition.w * 0.5 + 0.5;
          float coastLine = clamp(
            abs((sceneDistance - vViewDepth) * 2.0) / max(projectedDepth, 0.0001),
            0.0,
            1.0
          );

          coastLine = clamp(coastLine * (1.5 - 2.5 * length(waveOffset)), 0.0, 1.0);
          fresnel *= coastLine;
          waveOffset *= coastLine;
        #endif

        vec2 reflectionUv =
          vReflectionCoord.xy / vReflectionCoord.w + waveOffset * reflectionDistortion;
        vec3 reflection = texture2D(reflectionMap, reflectionUv).rgb;

        #ifdef REFRACTION
          vec3 refraction =
            texture2D(refractionMap, screenUv + waveOffset * refractionDistortion).rgb *
            mix(vec3(1.0), refractionTint, coastLine);
          vec3 color = mix(refraction, reflection * reflectionTint, fresnel);
        #else
          vec3 color = reflection * reflectionTint;
        #endif

        #ifdef SPECULAR
          vec3 halfVector = normalize(normalize(vLightVec) - cameraToPoint);
          float glossPower = pow(5000.0, glossiness);
          float specularTerm =
            pow(max(dot(halfVector, normal), 0.0), glossPower) * (glossPower + 2.0) / 8.0 * specularity;

          color += specularTerm * fresnel * reflection;
        #endif

        ${shadowFragment}

        #ifdef REFRACTION
          gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
        #else
          gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(fresnel, 0.0, 1.0));
        #endif
      }
    `,
  });

  material.userData.water = true;

  return material;
}
