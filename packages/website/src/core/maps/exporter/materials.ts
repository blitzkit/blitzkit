import type { Material } from "@gltf-transform/core";
import { times } from "lodash-es";
import type { MapMaterialExtras } from "../extras";
import type { DataNode, MapContext } from "./context";
import { setTextureSlot, type TextureLoader } from "./textures";

const SH_DC_FACTOR = 0.282094;

export interface EffectiveMaterial {
  fxName?: string;
  materialName?: string;
  flags: Record<string, number>;
  properties: Record<string, ArrayBuffer>;
  textures: Record<string, string>;
  enabledPresets: Record<string, unknown>;
  customCullMode?: number;
}

export interface ResolvedMaterial {
  material: Material;
  effective: EffectiveMaterial;
}

export function readFloats(buffer: ArrayBuffer | undefined, count: number) {
  if (!buffer || buffer.byteLength < count * 4) return undefined;

  const view = new DataView(buffer);

  return times(count, (index) =>
    view.getFloat32(view.byteLength - (count - index) * 4, true),
  );
}

export function readFloat(buffer: ArrayBuffer | undefined, fallback: number) {
  return readFloats(buffer, 1)?.[0] ?? fallback;
}

export function effectiveMaterial(
  node: DataNode | undefined,
  nodes: Map<bigint, DataNode>,
) {
  const chain: DataNode[] = [];
  let current = node;

  while (current) {
    chain.unshift({ ...current, ...current.configArchive_0 });
    current =
      current.parentMaterialKey === undefined
        ? undefined
        : nodes.get(current.parentMaterialKey);
  }

  return chain.reduce<EffectiveMaterial>(
    (merged, link) => ({
      fxName: link.fxName ?? merged.fxName,
      materialName: merged.materialName ?? link.materialName,
      flags: { ...merged.flags, ...link.flags },
      properties: { ...merged.properties, ...link.properties },
      textures: { ...merged.textures, ...link.textures },
      enabledPresets: { ...merged.enabledPresets, ...link.enabledPresets },
      customCullMode: link.customCullMode ?? merged.customCullMode,
    }),
    { flags: {}, properties: {}, textures: {}, enabledPresets: {} },
  );
}

export function treeVertexColors(
  colors: number[][],
  { properties }: EffectiveMaterial,
  renderObject: Record<string, any>,
) {
  const coefficients = renderObject["sto.SHCoeff"]
    ? Array.from(new Float32Array(renderObject["sto.SHCoeff"]))
    : undefined;

  if (coefficients) {
    const [brightness, contrast] = readFloats(
      properties.vertexAOBrightnessContrast,
      2,
    ) ?? [0, 1];
    const multiplier = readFloat(properties.shOcclusionMult, 2);

    return colors.map(([occlusion]) => {
      const vertexOcclusion = contrast * (occlusion - 0.5) + 0.5 + brightness;

      return times(
        3,
        (channel) =>
          SH_DC_FACTOR * coefficients[channel] * vertexOcclusion * multiplier,
      );
    });
  }

  const colorMultiplier = readFloats(properties.treeLeafColorMul, 4) ?? [
    0.5, 0.5, 0.5, 0.5,
  ];
  const occlusionMultiplier = readFloat(properties.treeLeafOcclusionMul, 0.5);
  const occlusionOffset = readFloat(properties.treeLeafOcclusionOffset, 0);

  return colors.map((color) =>
    times(
      3,
      (channel) =>
        color[channel] * colorMultiplier[channel] * occlusionMultiplier +
        occlusionOffset,
    ),
  );
}

function isWater(effective: EffectiveMaterial) {
  return (effective.fxName ?? "").includes("Water");
}

export function createMaterialResolver(
  context: MapContext,
  materialNodes: Map<bigint, DataNode>,
  textures: TextureLoader,
) {
  const { document } = context;
  const materials = new Map<string, Material>();
  let collisionMaterial: Material | undefined;

  function preload() {
    return Promise.all(
      [...materialNodes.values()].flatMap((node) => {
        const effective = effectiveMaterial(node, materialNodes);
        const {
          albedo,
          baseColorMap,
          lightmap,
          flowmap,
          decal,
          detail,
          normalmap,
        } = effective.textures;

        return [
          (albedo ?? baseColorMap) &&
            textures.load(albedo ?? baseColorMap, false),
          ...[lightmap, flowmap, decal, detail, isWater(effective) && normalmap]
            .filter((path): path is string => typeof path === "string")
            .map((path) => textures.load(path, true)),
        ].filter(Boolean);
      }),
    );
  }

  function resolveWater(
    materialKey: bigint,
    effective: EffectiveMaterial,
  ): ResolvedMaterial | undefined {
    const normalmap = textures.get(effective.textures.normalmap, true);

    if (!normalmap) return undefined;

    const key = `water|${materialKey}`;

    if (!materials.has(key)) {
      const { flags, properties } = effective;
      const material = document
        .createMaterial(effective.materialName)
        .setExtras({
          kind: "water",
          renderObject: flags.WATER_RENDER_OBJECT === 1,
          normal0Scale: readFloat(properties.normal0Scale, 1),
          normal1Scale: readFloat(properties.normal1Scale, 1),
          normal0ShiftPerSecond: readFloats(
            properties.normal0ShiftPerSecond,
            2,
          ) ?? [0, 0],
          normal1ShiftPerSecond: readFloats(
            properties.normal1ShiftPerSecond,
            2,
          ) ?? [0, 0],
          texCoordTransform: readFloats(properties.texCoordTransform0, 4) ?? [
            1, 0, 0, 1,
          ],
          tangent: readFloats(properties.inputTangent, 3) ?? [1, 0, 0],
          fresnelBias: readFloat(properties.fresnelBias, 0),
          fresnelPower: readFloat(properties.fresnelPow, 0),
          reflectionTint: readFloats(properties.reflectionTintColor, 3) ?? [
            1, 1, 1,
          ],
          reflectionDistortion: readFloat(properties.reflectionDistortion, 0),
          distortionFallSquareDist: readFloat(
            properties.distortionFallSquareDist,
            1,
          ),
          refractionDistortion: readFloat(properties.refractionDistortion, 0),
          refractionTint: readFloats(properties.refractionTintColor, 3) ?? [
            1, 1, 1,
          ],
          shadowReceiver: flags.SHADOW_RECEIVER === 1,
          shadowTint: readFloats(properties.pixelLitShadowColor, 3) ?? [
            0.9, 0.9, 0.9,
          ],
          specular:
            flags.SPECULAR === 1
              ? {
                  glossiness: readFloat(properties.inGlossiness, 0.5),
                  specularity: readFloat(properties.inSpecularity, 0.5),
                }
              : undefined,
        } satisfies MapMaterialExtras);

      setTextureSlot(document, material, "waterNormal", normalmap);
      materials.set(key, material);
    }

    return { material: materials.get(key)!, effective };
  }

  function resolve(materialKey: bigint): ResolvedMaterial | undefined {
    const effective = effectiveMaterial(
      materialNodes.get(materialKey),
      materialNodes,
    );
    const fxName = effective.fxName ?? "";

    if (fxName.includes("ShadowVolume")) return undefined;
    if (isWater(effective)) return resolveWater(materialKey, effective);

    const albedoPath =
      effective.textures.albedo ?? effective.textures.baseColorMap;
    const albedo = textures.get(albedoPath, false);

    if (!albedo) return undefined;

    const { flags, properties, enabledPresets } = effective;
    const usesLightmap =
      fxName.includes("TextureLightmap") || flags.MATERIAL_LIGHTMAP === 1;
    const usesDecal = fxName.includes("Decal") || flags.MATERIAL_DECAL === 1;
    const lightmapPath = usesLightmap
      ? effective.textures.lightmap
      : usesDecal
      ? effective.textures.decal
      : undefined;
    const detailPath =
      fxName.includes("Detail") || flags.MATERIAL_DETAIL === 1
        ? effective.textures.detail
        : undefined;
    const detail = textures.get(detailPath, true);
    const lightmap = textures.get(lightmapPath, true);
    const flowmap = enabledPresets.FlowMap
      ? textures.get(effective.textures.flowmap, true)
      : undefined;
    const alphaTest = enabledPresets.AlphaTest
      ? flags.ALPHATESTVALUE === 1
        ? readFloat(properties.alphatestThreshold, 0)
        : 0.5
      : 0;
    const alphaStep =
      enabledPresets.AlphaBlend && flags.ALPHASTEPVALUE === 1
        ? readFloat(properties.alphaStepValue, 0.5)
        : undefined;
    const extras = {
      kind: fxName.includes("SpeedTree")
        ? "speedTree"
        : fxName.includes("Skyobject")
        ? "sky"
        : "object",
      lightmap: !!lightmap,
      lightmapTransform: usesLightmap,
      detailScale: detail
        ? readFloats(properties.detailTileCoordScale, 2) ?? [1, 1]
        : undefined,
      flow: flowmap
        ? {
            speed: readFloat(properties.flowAnimSpeed, 0),
            offset: readFloat(properties.flowAnimOffset, 0),
          }
        : undefined,
      alphaTest,
      alphaStep,
      alphaBlend: !!enabledPresets.AlphaBlend,
      depthWrite: !enabledPresets.AlphaBlend || fxName.includes("Lightmap"),
      shadowReceiver: flags.SHADOW_RECEIVER === 1,
      blendByAngle:
        flags.BLEND_BY_ANGLE === 1
          ? {
              bounds: readFloats(properties.angleBlendBounds, 2) ?? [0, 1],
              power: readFloat(properties.angleBlendPower, 1),
              inversion: readFloat(properties.angleBlendInversion, 0),
            }
          : undefined,
      flatColor:
        flags.FLATCOLOR === 1 ? readFloats(properties.flatColor, 4) : undefined,
      flatAlbedo:
        flags.FLATALBEDO === 1
          ? readFloats(properties.flatColor, 4)
          : undefined,
      textureShift:
        flags.TEXTURE0_SHIFT_ENABLED === 1
          ? readFloats(properties.texture0Shift, 2)
          : undefined,
      textureShiftPerSecond:
        flags.TEXTURE0_ANIMATION_SHIFT === 1
          ? readFloats(properties.tex0ShiftPerSecond, 2)
          : undefined,
      doubleSided:
        effective.customCullMode === 0 ||
        fxName.includes("SpeedTree") ||
        alphaTest > 0,
    } satisfies MapMaterialExtras;
    const key = `${albedoPath}|${lightmapPath}|${detailPath}|${JSON.stringify(
      extras,
    )}`;

    if (!materials.has(key)) {
      const material = document
        .createMaterial(effective.materialName)
        .setDoubleSided(extras.doubleSided)
        .setExtras(extras);

      setTextureSlot(document, material, "albedo", albedo);

      if (lightmap) {
        setTextureSlot(document, material, "lightmap", lightmap);
        material.getOcclusionTextureInfo()!.setTexCoord(1);
      }

      if (flowmap) setTextureSlot(document, material, "flowmap", flowmap);
      if (detail) setTextureSlot(document, material, "detail", detail);

      materials.set(key, material);
    }

    return { material: materials.get(key)!, effective };
  }

  function resolveCollision(): ResolvedMaterial {
    collisionMaterial ??= document
      .createMaterial("collision")
      .setExtras({ kind: "collision" } satisfies MapMaterialExtras);

    return {
      material: collisionMaterial,
      effective: effectiveMaterial(undefined, materialNodes),
    };
  }

  return { preload, resolve, resolveCollision };
}

export type MaterialResolver = ReturnType<typeof createMaterialResolver>;
